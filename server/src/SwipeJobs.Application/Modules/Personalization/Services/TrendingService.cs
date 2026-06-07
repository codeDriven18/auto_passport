using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Common.Mapping;
using SwipeJobs.Application.Modules.Personalization.Interfaces;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Modules.Personalization.Services;

public class TrendingService : ITrendingService
{
    private readonly IUserActivityRepository _activityRepository;
    private readonly IJobRepository _jobRepository;

    public TrendingService(IUserActivityRepository activityRepository, IJobRepository jobRepository)
    {
        _activityRepository = activityRepository;
        _jobRepository = jobRepository;
    }

    public async Task<IReadOnlyList<JobDto>> GetTrendingJobsAsync(int limit, CancellationToken cancellationToken = default)
    {
        var views = await _activityRepository.GetJobActivityCountsAsync(ActivityType.JobViewed, cancellationToken);
        var saves = await _activityRepository.GetJobActivityCountsAsync(ActivityType.JobSaved, cancellationToken);
        var applies = await _activityRepository.GetJobActivityCountsAsync(ActivityType.JobApplied, cancellationToken);

        var allJobIds = views.Keys.Concat(saves.Keys).Concat(applies.Keys).Distinct().ToList();
        var scores = allJobIds
            .Select(id => new
            {
                JobId = id,
                Score = views.GetValueOrDefault(id) * 1
                    + saves.GetValueOrDefault(id) * 3
                    + applies.GetValueOrDefault(id) * 5,
            })
            .OrderByDescending(x => x.Score)
            .Take(limit)
            .ToList();

        var jobs = new List<JobDto>();
        foreach (var item in scores)
        {
            var job = await _jobRepository.GetByIdWithDetailsAsync(item.JobId, cancellationToken);
            if (job is null || !job.IsActive) continue;

            var badges = await GetTrendingBadgesAsync([item.JobId], cancellationToken);
            jobs.Add(JobMapper.ToDto(job, badges.GetValueOrDefault(item.JobId, Array.Empty<string>())));
        }

        if (jobs.Count >= limit) return jobs;

        var (fallback, _) = await _jobRepository.SearchAsync(new JobQueryDto(
            Search: null, Page: 1, PageSize: limit, SortBy: "createdAt", SortOrder: "desc"), cancellationToken);

        foreach (var job in fallback)
        {
            if (jobs.Any(j => j.Id == job.Id)) continue;
            jobs.Add(JobMapper.ToDto(job));
            if (jobs.Count >= limit) break;
        }

        return jobs;
    }

    public async Task<IReadOnlyDictionary<Guid, IReadOnlyList<string>>> GetTrendingBadgesAsync(
        IEnumerable<Guid> jobIds, CancellationToken cancellationToken = default)
    {
        var ids = jobIds.Distinct().ToList();
        if (ids.Count == 0) return new Dictionary<Guid, IReadOnlyList<string>>();

        var views = await _activityRepository.GetJobActivityCountsAsync(ActivityType.JobViewed, cancellationToken);
        var saves = await _activityRepository.GetJobActivityCountsAsync(ActivityType.JobSaved, cancellationToken);
        var applies = await _activityRepository.GetJobActivityCountsAsync(ActivityType.JobApplied, cancellationToken);

        var topViewed = views.OrderByDescending(x => x.Value).Take(5).Select(x => x.Key).ToHashSet();
        var topSaved = saves.OrderByDescending(x => x.Value).Take(5).Select(x => x.Key).ToHashSet();
        var topApplied = applies.OrderByDescending(x => x.Value).Take(5).Select(x => x.Key).ToHashSet();

        var result = new Dictionary<Guid, IReadOnlyList<string>>();
        foreach (var id in ids)
        {
            var badges = new List<string>();
            if (topViewed.Contains(id) && views.GetValueOrDefault(id) > 0) badges.Add("Most Viewed");
            if (topSaved.Contains(id) && saves.GetValueOrDefault(id) > 0) badges.Add("Most Saved");
            if (topApplied.Contains(id) && applies.GetValueOrDefault(id) > 0) badges.Add("Most Applied");
            if (badges.Count > 0) result[id] = badges;
        }

        return result;
    }
}
