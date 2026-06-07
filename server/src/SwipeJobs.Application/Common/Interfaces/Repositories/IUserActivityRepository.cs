using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common.Interfaces.Repositories;

public interface IUserActivityRepository : IRepository<UserActivity>
{
    Task<IReadOnlyList<UserActivity>> GetByUserProfileIdAsync(Guid userProfileId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserActivity>> GetRecentByUserAndTypeAsync(
        Guid userProfileId, ActivityType activityType, int limit, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Guid>> GetRecentViewedJobIdsAsync(Guid userProfileId, int limit, CancellationToken cancellationToken = default);
    Task<Dictionary<Guid, int>> GetJobActivityCountsAsync(ActivityType activityType, CancellationToken cancellationToken = default);
    Task<DateTime?> GetLastActivityAtAsync(Guid userProfileId, ActivityType activityType, CancellationToken cancellationToken = default);
}
