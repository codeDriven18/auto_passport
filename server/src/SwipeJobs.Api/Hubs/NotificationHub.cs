using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SwipeJobs.Api.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var profileId = Context.User?.FindFirstValue("profileId");
        if (!string.IsNullOrWhiteSpace(profileId))
            await Groups.AddToGroupAsync(Context.ConnectionId, ProfileGroup(profileId));

        await base.OnConnectedAsync();
    }

    public static string ProfileGroup(string profileId) => $"profile:{profileId}";
}
