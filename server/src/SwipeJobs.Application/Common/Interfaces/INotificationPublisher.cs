using SwipeJobs.Application.Common.Dtos;

namespace SwipeJobs.Application.Common.Interfaces;

public interface INotificationPublisher
{
    Task PublishAsync(Guid userProfileId, NotificationDto notification, CancellationToken cancellationToken = default);
}
