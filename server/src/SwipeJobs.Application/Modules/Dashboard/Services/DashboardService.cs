using SwipeJobs.Application.Common;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Common.Mapping;
using SwipeJobs.Application.Modules.Dashboard.Interfaces;
using SwipeJobs.Application.Modules.Personalization.Interfaces;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Modules.Dashboard.Services;

public class DashboardService : IDashboardService
{
    private const int RecentApplicationsLimit = 5;
    private const int SectionLimit = 4;

    private readonly IUserProfileRepository _profileRepository;
    private readonly ISavedJobRepository _savedJobRepository;
    private readonly IApplicationRepository _applicationRepository;
    private readonly IJobRepository _jobRepository;
    private readonly IRecommendationService _recommendationService;
    private readonly IActivityService _activityService;
    private readonly ITrendingService _trendingService;
    private readonly ICompanyFollowService _companyFollowService;
    private readonly IInterestService _interestService;
    private readonly INotificationService _notificationService;
    private readonly IUserActivityRepository _activityRepository;

    public DashboardService(
        IUserProfileRepository profileRepository,
        ISavedJobRepository savedJobRepository,
        IApplicationRepository applicationRepository,
        IJobRepository jobRepository,
        IRecommendationService recommendationService,
        IActivityService activityService,
        ITrendingService trendingService,
        ICompanyFollowService companyFollowService,
        IInterestService interestService,
        INotificationService notificationService,
        IUserActivityRepository activityRepository)
    {
        _profileRepository = profileRepository;
        _savedJobRepository = savedJobRepository;
        _applicationRepository = applicationRepository;
        _jobRepository = jobRepository;
        _recommendationService = recommendationService;
        _activityService = activityService;
        _trendingService = trendingService;
        _companyFollowService = companyFollowService;
        _interestService = interestService;
        _notificationService = notificationService;
        _activityRepository = activityRepository;
    }

    public async Task<UserDashboardDto?> GetUserDashboardAsync(
        Guid userProfileId,
        CancellationToken cancellationToken = default)
    {
        var profile = await _profileRepository.GetByIdWithDetailsAsync(userProfileId, cancellationToken);
        if (profile is null) return null;

        await _notificationService.GenerateForDashboardAsync(userProfileId, cancellationToken);

        var savedJobs = await _savedJobRepository.GetByUserProfileIdAsync(userProfileId, cancellationToken);
        var applications = await _applicationRepository.GetByUserProfileIdAsync(userProfileId, cancellationToken);

        var recentApplications = applications
            .OrderByDescending(a => a.AppliedAt)
            .Take(RecentApplicationsLimit)
            .Select(a =>
            {
                var jobDto = a.Job is not null ? JobMapper.ToDto(a.Job) : null;
                return ProfileMapper.ToDto(a, jobDto);
            })
            .ToList();

        var recommended = await _recommendationService.GetRecommendedJobsAsync(userProfileId, SectionLimit, cancellationToken);
        var trending = await _trendingService.GetTrendingJobsAsync(SectionLimit, cancellationToken);
        var followedJobs = await _companyFollowService.GetNewJobsFromFollowedAsync(userProfileId, SectionLimit, cancellationToken);

        var viewedIds = await _activityService.GetRecentViewedJobIdsAsync(userProfileId, SectionLimit, cancellationToken);
        var recentlyViewed = new List<JobDto>();
        var viewBadges = await _trendingService.GetTrendingBadgesAsync(viewedIds, cancellationToken);
        foreach (var jobId in viewedIds)
        {
            var job = await _jobRepository.GetByIdWithDetailsAsync(jobId, cancellationToken);
            if (job is not null && job.IsActive)
                recentlyViewed.Add(JobMapper.ToDto(job, viewBadges.GetValueOrDefault(jobId, Array.Empty<string>())));
        }

        var interests = await _interestService.GetAsync(userProfileId, cancellationToken)
            ?? await _interestService.RecalculateAsync(userProfileId, cancellationToken);

        var unread = await _notificationService.GetUnreadCountAsync(userProfileId, cancellationToken);
        var lastSwipe = await _activityRepository.GetLastActivityAtAsync(
            userProfileId, ActivityType.JobSkipped, cancellationToken)
            ?? await _activityRepository.GetLastActivityAtAsync(userProfileId, ActivityType.JobSaved, cancellationToken);

        var (allJobs, totalJobs) = await _jobRepository.SearchAsync(new JobQueryDto(
            Search: null, Page: 1, PageSize: 1), cancellationToken);
        var skippedCount = (await _activityRepository.GetRecentByUserAndTypeAsync(
            userProfileId, ActivityType.JobSkipped, 500, cancellationToken)).Count;
        var swipeRemaining = Math.Max(0, totalJobs - skippedCount - applications.Count - savedJobs.Count);

        return new UserDashboardDto(
            ProfileCompletenessChecker.CalculatePercentage(profile),
            savedJobs.Count,
            applications.Count,
            recentApplications,
            recommended,
            recentlyViewed,
            trending,
            followedJobs,
            interests,
            unread,
            swipeRemaining,
            lastSwipe);
    }
}
