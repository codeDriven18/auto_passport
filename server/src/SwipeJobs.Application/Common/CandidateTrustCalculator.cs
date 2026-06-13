using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common;

public static class CandidateTrustCalculator
{
    public static CandidateTrustLevel Compute(UserProfile profile)
    {
        var signals = CountSignals(profile);
        if (signals >= 6) return CandidateTrustLevel.Complete;
        if (signals >= 4) return CandidateTrustLevel.Strong;
        if (IsVerified(profile)) return CandidateTrustLevel.Verified;
        return CandidateTrustLevel.None;
    }

    public static int CountSignals(UserProfile profile)
    {
        var count = 0;
        if (!string.IsNullOrWhiteSpace(profile.Email)) count++;
        if (!string.IsNullOrWhiteSpace(profile.Phone)) count++;
        if (HasResume(profile)) count++;
        if (!string.IsNullOrWhiteSpace(profile.LinkedInUrl)) count++;
        if (!string.IsNullOrWhiteSpace(profile.GitHubUrl)) count++;
        if (!string.IsNullOrWhiteSpace(profile.WebsiteUrl)) count++;
        return count;
    }

    public static bool IsVerified(UserProfile profile) =>
        !string.IsNullOrWhiteSpace(profile.Email)
        && HasResume(profile)
        && (
            !string.IsNullOrWhiteSpace(profile.LinkedInUrl)
            || !string.IsNullOrWhiteSpace(profile.GitHubUrl)
            || !string.IsNullOrWhiteSpace(profile.WebsiteUrl));

    private static bool HasResume(UserProfile profile) =>
        !string.IsNullOrWhiteSpace(profile.ResumeUrl)
        || !string.IsNullOrWhiteSpace(profile.ResumeFileName);
}
