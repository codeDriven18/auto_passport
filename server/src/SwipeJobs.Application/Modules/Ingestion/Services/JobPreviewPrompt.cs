using System.Globalization;
using System.Text.RegularExpressions;
using SwipeJobs.Application.Modules.Ingestion.Models;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

internal static class JobPreviewPrompt
{
    public const string SystemPrompt = """
        You are a job board copywriter. Transform extracted job data into concise mobile card preview fields.
        Return valid JSON only. Do not explain. Do not use markdown. Do not use emojis.

        Rules:
        - displayTitle: professional normalized job title, max 60 characters
        - displayCompany: company name; if missing and extraction confidence >= 80 you may infer from channelHint; otherwise use exactly "Company not specified"
        - displaySalary: compact salary text for a card (e.g. "$80k–$120k", "Competitive", "Not disclosed")
        - displayLocation: compact location (e.g. "Remote", "Tashkent", "Hybrid · Berlin")
        - displaySkills: up to 5 most relevant skills, short labels
        - displaySummary: one professional sentence for a job card, max 180 characters, no raw Telegram tone

        Expected JSON:
        {
          "displayTitle": "",
          "displayCompany": "",
          "displaySalary": "",
          "displayLocation": "",
          "displaySkills": [],
          "displaySummary": ""
        }
        """;
}

internal static class JobPreviewTextSanitizer
{
    public const string CompanyNotSpecified = "Company not specified";
    public const int HighConfidenceCompanyThreshold = 80;

    private static readonly Regex EmojiRegex = new(@"[\p{Cs}\u200d\uFE0F]", RegexOptions.Compiled);

    private static readonly Regex WhitespaceRegex = new(@"\s+", RegexOptions.Compiled);

    public static string StripEmojis(string? value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : WhitespaceRegex.Replace(EmojiRegex.Replace(value, string.Empty).Trim(), " ");

    public static string Truncate(string value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;
        var trimmed = value.Trim();
        return trimmed.Length <= maxLength ? trimmed : trimmed[..maxLength].TrimEnd() + "…";
    }

    public static JobPreviewResult EnforceLimits(JobPreviewResult preview) => new(
        Truncate(StripEmojis(preview.DisplayTitle), 60),
        Truncate(StripEmojis(preview.DisplayCompany), 120),
        Truncate(StripEmojis(preview.DisplaySalary), 80),
        Truncate(StripEmojis(preview.DisplayLocation), 80),
        preview.DisplaySkills
            .Select(StripEmojis)
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(5)
            .ToList(),
        Truncate(StripEmojis(preview.DisplaySummary), 180));
}

internal static class JobPreviewJsonParser
{
    private static readonly System.Text.Json.JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static JobPreviewResult Parse(string responseText)
    {
        var json = NormalizeJsonPayload(responseText);
        var dto = System.Text.Json.JsonSerializer.Deserialize<JobPreviewDto>(json, JsonOptions)
            ?? throw new System.Text.Json.JsonException("Preview JSON deserialized to null.");

        return new JobPreviewResult(
            dto.DisplayTitle ?? string.Empty,
            dto.DisplayCompany ?? JobPreviewTextSanitizer.CompanyNotSpecified,
            dto.DisplaySalary ?? "Not disclosed",
            dto.DisplayLocation ?? "Location not specified",
            dto.DisplaySkills?.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim()).Take(5).ToList() ?? [],
            dto.DisplaySummary ?? string.Empty);
    }

    private static string NormalizeJsonPayload(string text)
    {
        var trimmed = text.Trim();
        if (trimmed.StartsWith("```", StringComparison.Ordinal))
        {
            var fenceEnd = trimmed.LastIndexOf("```", StringComparison.Ordinal);
            if (fenceEnd > 3)
                trimmed = trimmed[3..fenceEnd].Trim().TrimStart("json".ToCharArray()).Trim();
        }

        using var _ = System.Text.Json.JsonDocument.Parse(trimmed);
        return trimmed;
    }

    private sealed class JobPreviewDto
    {
        public string? DisplayTitle { get; set; }
        public string? DisplayCompany { get; set; }
        public string? DisplaySalary { get; set; }
        public string? DisplayLocation { get; set; }
        public List<string>? DisplaySkills { get; set; }
        public string? DisplaySummary { get; set; }
    }
}

internal static class JobPreviewFallbackGenerator
{
    public static JobPreviewResult Create(
        JobExtractionResult extraction,
        string? channelHint,
        int extractionConfidence)
    {
        var title = BuildTitle(extraction.Title, extraction.Description);
        var company = BuildCompany(extraction.CompanyName, channelHint, extractionConfidence);
        var salary = BuildSalary(extraction.SalaryMin, extraction.SalaryMax, extraction.Category);
        var location = BuildLocation(extraction);
        var skills = extraction.Skills.Take(5).Select(JobPreviewTextSanitizer.StripEmojis).Where(s => s.Length > 0).ToList();
        var summary = BuildSummary(extraction, title);

        return JobPreviewTextSanitizer.EnforceLimits(new JobPreviewResult(
            title,
            company,
            salary,
            location,
            skills,
            summary));
    }

    public static JobPreviewResult FromJobFields(
        string title,
        string description,
        string company,
        decimal? salaryMin,
        decimal? salaryMax,
        JobCategory category,
        bool isRemote,
        string? city,
        string? location,
        IReadOnlyList<string> skills)
    {
        var preview = Create(
            new JobExtractionResult(
                title,
                company,
                description,
                location,
                city,
                isRemote,
                salaryMin,
                salaryMax,
                category,
                JobLevel.NotApplicable,
                null,
                skills,
                ApplyMethodType.Unknown,
                null,
                null,
                null,
                null,
                100),
            null,
            100);

        return preview;
    }

    private static string BuildTitle(string? title, string? description)
    {
        var source = !string.IsNullOrWhiteSpace(title)
            ? title
            : description?.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).FirstOrDefault();

        source = JobPreviewTextSanitizer.StripEmojis(source);
        if (string.IsNullOrWhiteSpace(source)) return "Open Role";

        source = Regex.Replace(source, @"^(hiring|vacancy|job|position)\s*[:\-]\s*", string.Empty, RegexOptions.IgnoreCase).Trim();
        return JobPreviewTextSanitizer.Truncate(ToTitleCase(source), 60);
    }

    private static string BuildCompany(string? companyName, string? channelHint, int extractionConfidence)
    {
        var company = JobPreviewTextSanitizer.StripEmojis(companyName);
        if (!string.IsNullOrWhiteSpace(company)) return company;

        var hint = JobPreviewTextSanitizer.StripEmojis(channelHint);
        if (extractionConfidence >= JobPreviewTextSanitizer.HighConfidenceCompanyThreshold && !string.IsNullOrWhiteSpace(hint))
            return hint;

        return JobPreviewTextSanitizer.CompanyNotSpecified;
    }

    private static string BuildSalary(decimal? min, decimal? max, JobCategory category)
    {
        if (min is null && max is null)
            return category == JobCategory.Gig ? "Gig · Rate varies" : "Not disclosed";

        string Format(decimal value) => value >= 1000 ? $"${Math.Round(value / 1000m):0}k" : $"${value:0}";

        if (min is not null && max is not null && min != max)
            return $"{Format(min.Value)}–{Format(max.Value)}";
        var single = min ?? max!.Value;
        return Format(single);
    }

    private static string BuildLocation(JobExtractionResult extraction)
    {
        if (extraction.IsRemote == true) return "Remote";

        var city = JobPreviewTextSanitizer.StripEmojis(extraction.City);
        var location = JobPreviewTextSanitizer.StripEmojis(extraction.Location);
        if (!string.IsNullOrWhiteSpace(city) && !string.IsNullOrWhiteSpace(location) &&
            !location.Equals(city, StringComparison.OrdinalIgnoreCase))
            return $"{city} · {location}";

        return !string.IsNullOrWhiteSpace(city) ? city
            : !string.IsNullOrWhiteSpace(location) ? location
            : "Location not specified";
    }

    private static string BuildSummary(JobExtractionResult extraction, string title)
    {
        var raw = JobPreviewTextSanitizer.StripEmojis(extraction.Description);
        if (string.IsNullOrWhiteSpace(raw))
            raw = $"{title} opportunity with a focus on {string.Join(", ", extraction.Skills.Take(3))}.";

        raw = Regex.Replace(raw, @"https?://\S+", string.Empty);
        raw = Regex.Replace(raw, @"@[\w_]+", string.Empty);
        raw = Regex.Replace(raw, @"[\r\n]+", " ");
        raw = Regex.Replace(raw, @"\s{2,}", " ").Trim();

        if (string.IsNullOrWhiteSpace(raw)) return JobPreviewTextSanitizer.Truncate($"{title} role now accepting applications.", 180);

        if (!char.IsUpper(raw[0]))
            raw = char.ToUpper(raw[0], CultureInfo.InvariantCulture) + raw[1..];

        if (!raw.EndsWith('.')) raw += ".";

        return JobPreviewTextSanitizer.Truncate(raw, 180);
    }

    private static string ToTitleCase(string value)
    {
        var lower = value.ToLowerInvariant();
        return CultureInfo.InvariantCulture.TextInfo.ToTitleCase(lower);
    }
}
