using SwipeJobs.Application.Common.Dtos;

namespace SwipeJobs.Application.Common.Dtos;

public record UserDashboardDto(
    int ProfileCompletionPercentage,
    int SavedJobsCount,
    int ApplicationsCount,
    IReadOnlyList<ApplicationDto> RecentApplications,
    IReadOnlyList<JobDto> RecommendedJobs,
    IReadOnlyList<JobDto> RecentlyViewedJobs,
    IReadOnlyList<JobDto> TrendingJobs,
    IReadOnlyList<JobDto> FollowedCompanyJobs,
    UserInterestDto? Interests,
    int UnreadNotificationsCount,
    int SwipeRemainingEstimate,
    DateTime? LastSwipeAt);
