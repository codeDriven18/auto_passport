using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Common.Interfaces.Repositories;

public interface INotificationRepository : IRepository<Notification>
{
    Task<IReadOnlyList<Notification>> GetByUserProfileIdAsync(Guid userProfileId, int limit, CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(Guid userProfileId, CancellationToken cancellationToken = default);
    Task MarkAllReadAsync(Guid userProfileId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid userProfileId, string title, Guid? relatedJobId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Notification>> GetRecentAsync(int limit, CancellationToken cancellationToken = default);
}
