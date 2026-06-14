using SwipeJobs.Application.Modules.Ingestion.Models;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

internal static class AiExtractionMapper
{
    public static JobExtractionResult ToJobExtractionResult(ParsedJobCandidate ai)
    {
        var applyMethod = ResolveApplyMethod(ai.ApplyUrl, ai.Email, ai.TelegramContact, ai.Phone, ai.ApplyMethod);
        return new JobExtractionResult(
            ai.Title,
            ai.Company,
            ai.Description,
            ai.Location,
            ai.Remote == true ? "Remote" : ai.Location,
            ai.Remote,
            ai.SalaryMin,
            ai.SalaryMax,
            JobCategory.It,
            MapLevel(ai.ExperienceLevel),
            ai.EmploymentType,
            ai.Skills,
            applyMethod,
            ai.ApplyUrl,
            ai.Email,
            ai.TelegramContact,
            ai.Phone,
            ai.Confidence);
    }

    private static ApplyMethodType ResolveApplyMethod(
        string? url, string? email, string? telegram, string? phone, string? applyMethod)
    {
        if (!string.IsNullOrWhiteSpace(url)) return ApplyMethodType.Url;
        if (!string.IsNullOrWhiteSpace(email)) return ApplyMethodType.Email;
        if (!string.IsNullOrWhiteSpace(telegram)) return ApplyMethodType.Telegram;
        if (!string.IsNullOrWhiteSpace(phone)) return ApplyMethodType.Phone;

        if (string.IsNullOrWhiteSpace(applyMethod))
            return ApplyMethodType.Unknown;

        var lower = applyMethod.ToLowerInvariant();
        if (lower.Contains("url") || lower.Contains("link")) return ApplyMethodType.Url;
        if (lower.Contains("email")) return ApplyMethodType.Email;
        if (lower.Contains("telegram")) return ApplyMethodType.Telegram;
        if (lower.Contains("phone")) return ApplyMethodType.Phone;
        return ApplyMethodType.Unknown;
    }

    private static JobLevel MapLevel(string? experienceLevel)
    {
        if (string.IsNullOrWhiteSpace(experienceLevel))
            return JobLevel.NotApplicable;

        var lower = experienceLevel.ToLowerInvariant();
        if (lower.Contains("intern") || lower.Contains("graduate")) return JobLevel.Internship;
        if (lower.Contains("junior") || lower.Contains("entry")) return JobLevel.Junior;
        if (lower.Contains("mid") || lower.Contains("senior") || lower.Contains("lead"))
            return JobLevel.MidLevel;
        return JobLevel.NotApplicable;
    }
}
