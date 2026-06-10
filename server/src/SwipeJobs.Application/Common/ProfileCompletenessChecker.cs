using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Common;

public static class ProfileCompletenessChecker
{
    public static bool IsComplete(UserProfile profile)
    {
        if (string.IsNullOrWhiteSpace(profile.FirstName)) return false;
        if (string.IsNullOrWhiteSpace(profile.LastName)) return false;
        if (string.IsNullOrWhiteSpace(profile.Email)) return false;
        if (string.IsNullOrWhiteSpace(profile.Phone)) return false;

        var hasBackground = profile.Educations.Count > 0
            || profile.Skills.Count > 0
            || profile.Experiences.Count > 0;

        return hasBackground;
    }

    public static ProfileCompletenessDto Check(UserProfile profile)
    {
        var missing = new List<string>();

        if (string.IsNullOrWhiteSpace(profile.FirstName)) missing.Add("First name");
        if (string.IsNullOrWhiteSpace(profile.LastName)) missing.Add("Last name");
        if (string.IsNullOrWhiteSpace(profile.Email)) missing.Add("Email");
        if (string.IsNullOrWhiteSpace(profile.Phone)) missing.Add("Phone");

        if (profile.Educations.Count == 0 && profile.Skills.Count == 0 && profile.Experiences.Count == 0)
            missing.Add("At least one education, skill, or experience entry");

        return new ProfileCompletenessDto(missing.Count == 0, missing, CalculatePercentage(profile));
    }

    public static int CalculatePercentage(UserProfile profile)
    {
        var checks = new (bool Done, int Weight)[]
        {
            (!string.IsNullOrWhiteSpace(profile.FirstName), 8),
            (!string.IsNullOrWhiteSpace(profile.LastName), 8),
            (!string.IsNullOrWhiteSpace(profile.Email), 12),
            (!string.IsNullOrWhiteSpace(profile.Phone), 12),
            (!string.IsNullOrWhiteSpace(profile.Location), 5),
            (!string.IsNullOrWhiteSpace(profile.Bio), 5),
            (!string.IsNullOrWhiteSpace(profile.ResumeUrl), 15),
            (profile.Educations.Count > 0 || profile.Skills.Count > 0 || profile.Experiences.Count > 0, 35),
        };

        return checks.Where(c => c.Done).Sum(c => c.Weight);
    }

    public static void UpdateFlag(UserProfile profile)
    {
        profile.IsProfileComplete = IsComplete(profile);
    }

    public static void UpdateFlag(
        UserProfile profile,
        int? educationCount,
        int? skillCount,
        int? experienceCount)
    {
        if (string.IsNullOrWhiteSpace(profile.FirstName)
            || string.IsNullOrWhiteSpace(profile.LastName)
            || string.IsNullOrWhiteSpace(profile.Email)
            || string.IsNullOrWhiteSpace(profile.Phone))
        {
            profile.IsProfileComplete = false;
            return;
        }

        var eduCount = educationCount ?? profile.Educations.Count;
        var skillCountResolved = skillCount ?? profile.Skills.Count;
        var experienceCountResolved = experienceCount ?? profile.Experiences.Count;

        profile.IsProfileComplete = eduCount > 0 || skillCountResolved > 0 || experienceCountResolved > 0;
    }
}
