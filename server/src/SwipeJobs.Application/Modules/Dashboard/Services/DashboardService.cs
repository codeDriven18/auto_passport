using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
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
    private static readonly TimeSpan NotificationGenerationCooldown = TimeSpan.FromMinutes(30);

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
    private readonly IMemoryCache _cache;
    private readonly ILogger<DashboardService> _logger;

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
        IUserActivityRepository activityRepository,
        IMemoryCache cache,
        ILogger<DashboardService> logger)
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
        _cache = cache;
        _logger = logger;
    }

    public UserDashboardDto CreateEmptyDashboard(int profileCompletionPercentage = 0)
        => new(
            profileCompletionPercentage,
            SavedJobsCount: 0,
            ApplicationsCount: 0,
            RecentApplications: Array.Empty<ApplicationDto>(),
            RecommendedJobs: Array.Empty<JobDto>(),
            RecentlyViewedJobs: Array.Empty<JobDto>(),
            TrendingJobs: Array.Empty<JobDto>(),
            FollowedCompanyJobs: Array.Empty<JobDto>(),
            Interests: null,
            UnreadNotificationsCount: 0,
            SwipeRemainingEstimate: 0,
            LastSwipeAt: null);

    public async Task<UserDashboardDto> GetMyDashboardAsync(
        Guid userId,
        Guid? profileIdClaim,
        UserRole? role,
        CancellationToken cancellationToken = default)
    {
        if (role is UserRole.Company)
        {
            _logger.LogInformation(
                "Dashboard skipped for employer userId={UserId}; returning empty payload",
                userId);
            return CreateEmptyDashboard();
        }

        var profileId = profileIdClaim;
        if (!profileId.HasValue)
        {
            var profile = await _profileRepository.GetByUserIdAsync(userId, cancellationToken);
            profileId = profile?.Id;
            if (profileId.HasValue)
            {
                _logger.LogWarning(
                    "Dashboard resolved profileId={ProfileId} from userId={UserId} (JWT claim missing)",
                    profileId,
                    userId);
            }
        }

        if (!profileId.HasValue)
        {
            _logger.LogWarning(
                "Dashboard has no profile for userId={UserId}; returning empty payload",
                userId);
            return CreateEmptyDashboard();
        }

        try
        {
            return await GetUserDashboardAsync(profileId.Value, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Dashboard generation failed for userId={UserId} profileId={ProfileId}; returning empty payload",
                userId,
                profileId);
            return CreateEmptyDashboard();
        }
    }

    public async Task<UserDashboardDto> GetUserDashboardAsync(
        Guid userProfileId,
        CancellationToken cancellationToken = default)
    {
        var profile = await _profileRepository.GetByIdWithDetailsAsync(userProfileId, cancellationToken);
        if (profile is null)
        {
            _logger.LogWarning(
                "Dashboard profile not found profileId={ProfileId}; returning empty payload",
                userProfileId);
            return CreateEmptyDashboard();
        }

        var completionPct = ProfileCompletenessChecker.CalculatePercentage(profile);

        try
        {
            UserInterestDto? interests;
            try
            {
                interests = await _interestService.GetAsync(userProfileId, cancellationToken)
                    ?? await _interestService.RecalculateAsync(userProfileId, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Dashboard interest calculation skipped for profileId={ProfileId}",
                    userProfileId);
                interests = null;
            }

            // EF Core DbContext is not thread-safe — load sequentially, not in parallel.
            var savedJobs = await _savedJobRepository.GetByUserProfileIdAsync(userProfileId, cancellationToken);
            var applications = await _applicationRepository.GetByUserProfileIdAsync(userProfileId, cancellationToken);
            var recommended = await _recommendationService.GetRecommendedJobsAsync(
                userProfileId, SectionLimit, cancellationToken);
            var trending = await _trendingService.GetTrendingJobsAsync(SectionLimit, cancellationToken);
            var followedJobs = await _companyFollowService.GetNewJobsFromFollowedAsync(
                userProfileId, SectionLimit, cancellationToken);
            var viewedIds = await _activityService.GetRecentViewedJobIdsAsync(
                userProfileId, SectionLimit, cancellationToken);
            var unread = await _notificationService.GetUnreadCountAsync(userProfileId, cancellationToken);
            var lastSwipeSkipped = await _activityRepository.GetLastActivityAtAsync(
                userProfileId, ActivityType.JobSkipped, cancellationToken);
            var lastSwipeSaved = await _activityRepository.GetLastActivityAtAsync(
                userProfileId, ActivityType.JobSaved, cancellationToken);
            var (_, totalJobs) = await _jobRepository.SearchAsync(
                new JobQueryDto(Search: null, Page: 1, PageSize: 1), cancellationToken);
            var skippedCount = await _activityRepository.CountByUserAndTypeAsync(
                userProfileId, ActivityType.JobSkipped, cancellationToken);
            await MaybeGenerateNotificationsAsync(userProfileId, cancellationToken);

            var lastSwipe = lastSwipeSkipped ?? lastSwipeSaved;

            var recentApplications = applications
                .OrderByDescending(a => a.AppliedAt)
                .Take(RecentApplicationsLimit)
                .Select(a =>
                {
                    var jobDto = a.Job is not null ? JobMapper.ToDto(a.Job) : null;
                    return ProfileMapper.ToDto(a, jobDto);
                })
                .ToList();

            var recentlyViewed = new List<JobDto>();
            if (viewedIds.Count > 0)
            {
                var viewBadges = await _trendingService.GetTrendingBadgesAsync(viewedIds, cancellationToken);
                var viewedJobs = await _jobRepository.GetByIdsWithDetailsAsync(viewedIds, cancellationToken);
                var jobMap = viewedJobs.Where(j => j.IsActive).ToDictionary(j => j.Id);

                foreach (var jobId in viewedIds)
                {
                    if (jobMap.TryGetValue(jobId, out var job))
                        recentlyViewed.Add(JobMapper.ToDto(job, viewBadges.GetValueOrDefault(jobId, Array.Empty<string>())));
                }
            }

            var swipeRemaining = Math.Max(0, totalJobs - skippedCount - applications.Count - savedJobs.Count);

            return new UserDashboardDto(
                completionPct,
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
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Dashboard partial failure for profileId={ProfileId}; returning minimal payload",
                userProfileId);
            return CreateEmptyDashboard(completionPct);
        }
    }

    private async Task MaybeGenerateNotificationsAsync(Guid userProfileId, CancellationToken cancellationToken)
    {
        try
        {
            var cacheKey = $"dashboard-notif-gen:{userProfileId}";
            if (_cache.TryGetValue(cacheKey, out _))
                return;

            await _notificationService.GenerateForDashboardAsync(userProfileId, cancellationToken);
            _cache.Set(cacheKey, true, NotificationGenerationCooldown);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Dashboard notification generation skipped for profileId={ProfileId}",
                userProfileId);
        }
    }
}
