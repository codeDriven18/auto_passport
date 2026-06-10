using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SwipeJobs.Api.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? Context.User?.FindFirstValue("sub");
        var profileId = Context.User?.FindFirstValue("profileId");

        _logger.LogWarning(
            "SignalR connected: ConnectionId={ConnectionId} UserId={UserId} ProfileId={ProfileId} Transport={Transport}",
            Context.ConnectionId,
            userId ?? "(none)",
            profileId ?? "(none)",
            Context.GetHttpContext()?.WebSockets.IsWebSocketRequest == true ? "WebSockets" : "HTTP");

        if (!string.IsNullOrWhiteSpace(profileId))
            await Groups.AddToGroupAsync(Context.ConnectionId, ProfileGroup(profileId));

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogWarning(
            exception,
            "SignalR disconnected: ConnectionId={ConnectionId}",
            Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    public static string ProfileGroup(string profileId) => $"profile:{profileId}";
}
