using System.Text.Json;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common.Personalization;

public static class InterestCalculator
{
    private const int AppliedWeight = 5;
    private const int SavedWeight = 4;
    private const int ViewedWeight = 2;
    private const int SkippedWeight = -3;
    private const int SkillWeight = 3;

    public static UserInterestProfile Compute(
        UserProfile profile,
        IReadOnlyList<UserActivity> activities,
        IReadOnlyList<Job> activityJobs,
        IReadOnlyList<Job> savedJobs,
        IReadOnlyList<Job> appliedJobs)
    {
        var categories = new Dictionary<string, int>();
        var technologies = new Dictionary<string, int>();
        var cities = new Dictionary<string, int>();
        var salaries = new List<decimal>();

        void AddJobSignals(Job job, int weight)
        {
            AddScore(categories, job.Category.ToString(), weight);
            AddCity(cities, job);
            AddSalary(salaries, job);
            foreach (var tag in GetJobTags(job))
                AddScore(technologies, tag, weight);
        }

        foreach (var skill in profile.Skills)
        {
            if (string.IsNullOrWhiteSpace(skill.Name)) continue;
            foreach (var slug in MapSkillToTags(skill.Name))
                AddScore(technologies, slug, SkillWeight);
        }

        foreach (var job in savedJobs)
            AddJobSignals(job, SavedWeight);

        foreach (var job in appliedJobs)
            AddJobSignals(job, AppliedWeight);

        var jobMap = activityJobs.ToDictionary(j => j.Id);
        foreach (var activity in activities)
        {
            if (activity.JobId is null || !jobMap.TryGetValue(activity.JobId.Value, out var job))
                continue;

            var weight = activity.ActivityType switch
            {
                ActivityType.JobViewed => ViewedWeight,
                ActivityType.JobSaved => SavedWeight,
                ActivityType.JobApplied => AppliedWeight,
                ActivityType.JobSkipped => SkippedWeight,
                _ => 0,
            };

            if (weight != 0)
                AddJobSignals(job, weight);
        }

        decimal? salaryMin = null;
        decimal? salaryMax = null;
        if (salaries.Count > 0)
        {
            salaries.Sort();
            salaryMin = salaries[salaries.Count / 4];
            salaryMax = salaries[Math.Min(salaries.Count - 1, salaries.Count * 3 / 4)];
        }

        return new UserInterestProfile
        {
            UserProfileId = profile.Id,
            PreferredCategoriesJson = JsonSerializer.Serialize(categories),
            PreferredTechnologiesJson = JsonSerializer.Serialize(technologies),
            PreferredCitiesJson = JsonSerializer.Serialize(cities),
            PreferredSalaryMin = salaryMin,
            PreferredSalaryMax = salaryMax,
            LastCalculatedAt = DateTime.UtcNow,
        };
    }

    public static UserInterestDto ToDto(UserInterestProfile profile) => new(
        DeserializeScores(profile.PreferredCategoriesJson),
        DeserializeScores(profile.PreferredTechnologiesJson),
        DeserializeScores(profile.PreferredCitiesJson),
        profile.PreferredSalaryMin,
        profile.PreferredSalaryMax,
        profile.LastCalculatedAt);

    public static Dictionary<string, int> DeserializeScores(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, int>>(json) ?? new Dictionary<string, int>();
        }
        catch
        {
            return new Dictionary<string, int>();
        }
    }

    private static void AddScore(Dictionary<string, int> map, string key, int weight)
    {
        if (string.IsNullOrWhiteSpace(key)) return;
        map[key] = map.GetValueOrDefault(key) + weight;
    }

    private static void AddCity(Dictionary<string, int> cities, Job job)
    {
        var city = job.IsRemote ? "Remote" : (job.City ?? job.Location ?? "Flexible");
        AddScore(cities, city, 1);
    }

    private static void AddSalary(List<decimal> salaries, Job job)
    {
        var value = job.SalaryMax ?? job.SalaryMin;
        if (value.HasValue)
            salaries.Add(value.Value);
    }

    private static IEnumerable<string> GetJobTags(Job job)
        => job.JobTags
            .Select(jt => jt.Tag.Slug ?? jt.Tag.Name)
            .Where(s => !string.IsNullOrWhiteSpace(s));

    private static IEnumerable<string> MapSkillToTags(string skill)
    {
        var s = skill.Trim().ToLower();
        if (s.Contains("react")) yield return "react";
        if (s.Contains("typescript") || s == "ts") yield return "typescript";
        if (s.Contains("c#") || s.Contains("dotnet")) yield return "csharp";
        if (s.Contains("python")) yield return "python";
        if (s.Contains("devops")) yield return "devops";
        if (s.Contains("qa") || s.Contains("test")) yield return "qa";
        if (s.Contains("mobile")) yield return "mobile";
        if (s.Contains("data")) yield return "data";
        if (s.Contains("frontend")) yield return "frontend";
        if (s.Contains("backend")) yield return "backend";
        if (s.Contains("full")) yield return "fullstack";
    }
}
