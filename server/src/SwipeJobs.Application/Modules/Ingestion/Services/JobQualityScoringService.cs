using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

public class JobQualityScoringService
{
    public (int Completeness, int Trust, int Spam) Score(
        JobExtractionResult extraction,
        int sourceTrustScore,
        string rawText)
    {
        var completeness = ScoreCompleteness(extraction);
        var spam = ScoreSpam(rawText, extraction);
        var trust = ScoreTrust(extraction, sourceTrustScore, completeness, spam);
        return (completeness, trust, spam);
    }

    private static int ScoreCompleteness(JobExtractionResult e)
    {
        var score = 0;
        if (!string.IsNullOrWhiteSpace(e.Title)) score += 20;
        if (!string.IsNullOrWhiteSpace(e.CompanyName)) score += 15;
        if (!string.IsNullOrWhiteSpace(e.Description) && e.Description.Length > 50) score += 15;
        if (e.SalaryMin.HasValue || e.SalaryMax.HasValue) score += 15;
        if (!string.IsNullOrWhiteSpace(e.Location) || e.City is not null || e.IsRemote == true) score += 10;
        if (e.ApplyMethod != Domain.Enums.ApplyMethodType.Unknown) score += 15;
        if (e.Skills.Count > 0) score += 10;
        return Math.Clamp(score, 0, 100);
    }

    private static int ScoreSpam(string rawText, JobExtractionResult e)
    {
        var lower = rawText.ToLowerInvariant();
        var score = 0;
        if (RegexSpam(lower, @"\b(crypto|casino|betting|forex|mlm)\b")) score += 40;
        if (RegexSpam(lower, @"\b(earn \$|work from phone|no experience needed)\b")) score += 25;
        if (string.IsNullOrWhiteSpace(e.CompanyName)) score += 15;
        if (e.ApplyMethod == Domain.Enums.ApplyMethodType.Unknown) score += 10;
        if (rawText.Length < 40) score += 20;
        return Math.Clamp(score, 0, 100);
    }

    private static int ScoreTrust(JobExtractionResult e, int sourceTrust, int completeness, int spam)
    {
        var score = (int)(sourceTrust * 0.4 + completeness * 0.4 + e.Confidence * 0.2);
        score -= spam / 3;
        return Math.Clamp(score, 0, 100);
    }

    private static bool RegexSpam(string text, string pattern) =>
        System.Text.RegularExpressions.Regex.IsMatch(text, pattern, System.Text.RegularExpressions.RegexOptions.IgnoreCase);
}
