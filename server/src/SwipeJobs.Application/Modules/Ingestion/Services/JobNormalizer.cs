using SwipeJobs.Application.Modules.Ingestion.Services;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

public class JobNormalizer
{
    private static readonly Dictionary<string, string> TitleAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        ["frontend engineer"] = "Frontend Developer",
        ["frontend developer"] = "Frontend Developer",
        ["react engineer"] = "Frontend Developer",
        ["backend engineer"] = "Backend Developer",
        ["full stack developer"] = "Full Stack Developer",
        ["fullstack developer"] = "Full Stack Developer",
    };

    public JobExtractionResult Normalize(JobExtractionResult input)
    {
        var title = NormalizeTitle(input.Title);
        var location = NormalizeLocation(input.Location, input.IsRemote);
        var city = NormalizeLocation(input.City, input.IsRemote);
        var employment = NormalizeEmployment(input.EmploymentType);
        var skills = input.Skills.Select(NormalizeSkill).Where(s => !string.IsNullOrWhiteSpace(s)).Distinct(StringComparer.OrdinalIgnoreCase).ToList();

        return input with
        {
            Title = title,
            Location = location,
            City = city,
            EmploymentType = employment,
            Skills = skills,
        };
    }

    private static string? NormalizeTitle(string? title)
    {
        if (string.IsNullOrWhiteSpace(title)) return null;
        var trimmed = title.Trim();
        return TitleAliases.TryGetValue(trimmed.ToLowerInvariant(), out var canonical) ? canonical : trimmed;
    }

    private static string? NormalizeLocation(string? location, bool? isRemote)
    {
        if (isRemote == true) return "Remote";
        if (string.IsNullOrWhiteSpace(location)) return null;
        var lower = location.Trim().ToLowerInvariant();
        if (lower is "remote" or "wfh" or "work from home" or "worldwide") return "Remote";
        if (lower.Contains("hybrid", StringComparison.Ordinal)) return "Hybrid";
        return location.Trim();
    }

    private static string? NormalizeEmployment(string? employment)
    {
        if (string.IsNullOrWhiteSpace(employment)) return null;
        var lower = employment.Trim().ToLowerInvariant();
        return lower switch
        {
            "full time" or "full-time" or "ft" => "Full-time",
            "part time" or "part-time" => "Part-time",
            "contract" or "freelance" => "Contract",
            _ => employment.Trim(),
        };
    }

    private static string NormalizeSkill(string skill) => skill.Trim().ToLowerInvariant() switch
    {
        "c#" => "C#",
        ".net" or "dotnet" => ".NET",
        "next.js" or "nextjs" => "Next.js",
        _ => char.ToUpper(skill[0]) + skill[1..].ToLowerInvariant(),
    };
}
