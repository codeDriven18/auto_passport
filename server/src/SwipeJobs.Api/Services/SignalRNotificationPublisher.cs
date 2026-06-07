using Microsoft.AspNetCore.SignalR;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Api.Hubs;

namespace SwipeJobs.Api.Services;

public class SignalRNotificationPublisher : INotificationPublisher
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRNotificationPublisher(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task PublishAsync(Guid userProfileId, NotificationDto notification, CancellationToken cancellationToken = default)
        => _hubContext.Clients
            .Group(NotificationHub.ProfileGroup(userProfileId.ToString()))
            .SendAsync("NotificationReceived", notification, cancellationToken);
}
