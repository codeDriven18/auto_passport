using System.Text.Json;
using System.Text.RegularExpressions;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

public record JobExtractionResult(
    string? Title,
    string? CompanyName,
    string? Description,
    string? Location,
    string? City,
    bool? IsRemote,
    decimal? SalaryMin,
    decimal? SalaryMax,
    JobCategory Category,
    JobLevel Level,
    string? EmploymentType,
    IReadOnlyList<string> Skills,
    ApplyMethodType ApplyMethod,
    string? ApplyUrl,
    string? ApplyEmail,
    string? ApplyTelegram,
    string? ApplyPhone,
    int Confidence);

/// <summary>Structured extraction from raw messages. Only returns values found in text — never hallucinates.</summary>
public class JobExtractionService
{
    private static readonly Regex UrlRegex = new(@"https?://[^\s<>""']+", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex EmailRegex = new(@"[\w.+-]+@[\w-]+\.[\w.-]+", RegexOptions.Compiled);
    private static readonly Regex PhoneRegex = new(@"\+?\d[\d\s\-()]{7,}\d", RegexOptions.Compiled);
    private static readonly Regex TelegramHandleRegex = new(@"(?:@|t\.me/)([a-zA-Z0-9_]{4,32})", RegexOptions.Compiled);
    private static readonly Regex SalaryRegex = new(
        @"(?:\$|€|USD|EUR)?\s*(\d[\d\s.,]*)\s*(?:-|–|to)\s*(?:\$|€|USD|EUR)?\s*(\d[\d\s.,]*)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public JobExtractionResult Extract(string rawText)
    {
        if (string.IsNullOrWhiteSpace(rawText))
            return Empty(0);

        var lines = rawText.Split('\n', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        var title = lines.FirstOrDefault(l => l.Length >= 8 && l.Length <= 120);
        var company = ExtractCompany(lines);
        var description = string.Join("\n", lines.Skip(1).Take(8));
        var location = ExtractLocation(rawText);
        var isRemote = DetectRemote(rawText);
        var (salaryMin, salaryMax) = ExtractSalary(rawText);
        var skills = ExtractSkills(rawText);
        var applyUrl = UrlRegex.Match(rawText).Value;
        var applyEmail = EmailRegex.Match(rawText).Value;
        var applyTelegram = TelegramHandleRegex.Match(rawText).Groups[1].Value;
        var applyPhone = PhoneRegex.Match(rawText).Value;
        var applyMethod = ResolveApplyMethod(applyUrl, applyEmail, applyTelegram, applyPhone);
        var employment = DetectEmployment(rawText);
        var level = DetectLevel(rawText);
        var category = DetectCategory(rawText, skills);

        var confidence = ScoreConfidence(title, company, description, salaryMin, applyMethod);

        return new JobExtractionResult(
            title,
            company,
            description,
            location,
            isRemote == true ? "Remote" : location,
            isRemote,
            salaryMin,
            salaryMax,
            category,
            level,
            employment,
            skills,
            applyMethod,
            string.IsNullOrWhiteSpace(applyUrl) ? null : applyUrl,
            string.IsNullOrWhiteSpace(applyEmail) ? null : applyEmail,
            string.IsNullOrWhiteSpace(applyTelegram) ? null : applyTelegram,
            string.IsNullOrWhiteSpace(applyPhone) ? null : applyPhone,
            confidence);
    }

    private static JobExtractionResult Empty(int confidence) => new(
        null, null, null, null, null, null, null, null,
        JobCategory.It, JobLevel.NotApplicable, null,
        Array.Empty<string>(), ApplyMethodType.Unknown,
        null, null, null, null, confidence);

    private static string? ExtractCompany(string[] lines)
    {
        foreach (var line in lines.Skip(1).Take(5))
        {
            if (line.StartsWith("Company:", StringComparison.OrdinalIgnoreCase))
                return line["Company:".Length..].Trim();
            if (line.StartsWith("🏢", StringComparison.Ordinal) && line.Length > 2)
                return line[2..].Trim();
        }
        return null;
    }

    private static string? ExtractLocation(string text)
    {
        var match = Regex.Match(text, @"(?:Location|📍)\s*:?\s*(.+)", RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value.Trim() : null;
    }

    private static bool? DetectRemote(string text)
    {
        var lower = text.ToLowerInvariant();
        if (Regex.IsMatch(lower, @"\b(remote|wfh|work from home|worldwide)\b"))
            return true;
        if (Regex.IsMatch(lower, @"\b(on-?site|office|hybrid)\b"))
            return false;
        return null;
    }

    private static (decimal? Min, decimal? Max) ExtractSalary(string text)
    {
        var match = SalaryRegex.Match(text);
        if (!match.Success) return (null, null);
        if (!decimal.TryParse(match.Groups[1].Value.Replace(",", "").Replace(" ", ""), out var min))
            return (null, null);
        if (!decimal.TryParse(match.Groups[2].Value.Replace(",", "").Replace(" ", ""), out var max))
            return (min, null);
        return (Math.Min(min, max), Math.Max(min, max));
    }

    private static IReadOnlyList<string> ExtractSkills(string text)
    {
        var known = new[] { "react", "typescript", "node", "python", "java", "csharp", "c#", "aws", "docker", "kubernetes", "sql", "postgres", "angular", "vue", "next.js", "dotnet", ".net" };
        var lower = text.ToLowerInvariant();
        return known.Where(s => lower.Contains(s, StringComparison.Ordinal)).Distinct().Take(8).ToList();
    }

    private static string? DetectEmployment(string text)
    {
        var lower = text.ToLowerInvariant();
        if (lower.Contains("contract", StringComparison.Ordinal)) return "Contract";
        if (lower.Contains("part-time", StringComparison.Ordinal) || lower.Contains("part time", StringComparison.Ordinal)) return "Part-time";
        if (lower.Contains("full-time", StringComparison.Ordinal) || lower.Contains("full time", StringComparison.Ordinal)) return "Full-time";
        return null;
    }

    private static JobLevel DetectLevel(string text)
    {
        var lower = text.ToLowerInvariant();
        if (Regex.IsMatch(lower, @"\b(intern|internship|graduate)\b")) return JobLevel.Internship;
        if (Regex.IsMatch(lower, @"\b(junior|jr\.?|entry)\b")) return JobLevel.Junior;
        if (Regex.IsMatch(lower, @"\b(mid|middle|senior|sr\.?|lead)\b")) return JobLevel.MidLevel;
        return JobLevel.NotApplicable;
    }

    private static JobCategory DetectCategory(string text, IReadOnlyList<string> skills)
    {
        var lower = text.ToLowerInvariant();
        if (lower.Contains("gig", StringComparison.Ordinal) || lower.Contains("freelance", StringComparison.Ordinal))
            return JobCategory.Gig;
        return JobCategory.It;
    }

    private static ApplyMethodType ResolveApplyMethod(string? url, string? email, string? telegram, string? phone)
    {
        if (!string.IsNullOrWhiteSpace(url)) return ApplyMethodType.Url;
        if (!string.IsNullOrWhiteSpace(email)) return ApplyMethodType.Email;
        if (!string.IsNullOrWhiteSpace(telegram)) return ApplyMethodType.Telegram;
        if (!string.IsNullOrWhiteSpace(phone)) return ApplyMethodType.Phone;
        return ApplyMethodType.Unknown;
    }

    private static int ScoreConfidence(string? title, string? company, string? description, decimal? salary, ApplyMethodType apply)
    {
        var score = 20;
        if (!string.IsNullOrWhiteSpace(title)) score += 25;
        if (!string.IsNullOrWhiteSpace(company)) score += 15;
        if (!string.IsNullOrWhiteSpace(description) && description.Length > 40) score += 15;
        if (salary.HasValue) score += 10;
        if (apply != ApplyMethodType.Unknown) score += 15;
        return Math.Clamp(score, 0, 100);
    }
}
