using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SwipeJobs.Application.Modules.Messaging.Interfaces;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IMessagingService _messagingService;

    public ChatHub(IMessagingService messagingService)
    {
        _messagingService = messagingService;
    }

    public async Task JoinConversation(string conversationId)
    {
        if (!Guid.TryParse(conversationId, out var id))
            return;

        var userId = ParseGuid(ClaimTypes.NameIdentifier) ?? ParseGuid("sub");
        var role = ParseRole();
        if (!userId.HasValue || role is null)
            return;

        var companyId = ParseGuid("companyId");
        var profileId = ParseGuid("profileId");

        var allowed = await _messagingService.CanAccessConversationAsync(
            id, userId.Value, role.Value, companyId, profileId, Context.ConnectionAborted);

        if (!allowed)
            return;

        await Groups.AddToGroupAsync(Context.ConnectionId, ConversationGroup(id));
    }

    public async Task LeaveConversation(string conversationId)
    {
        if (Guid.TryParse(conversationId, out var id))
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, ConversationGroup(id));
    }

    public async Task SendTyping(string conversationId)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? Context.User?.FindFirstValue("sub");
        if (!Guid.TryParse(conversationId, out var id) || string.IsNullOrWhiteSpace(userId))
            return;

        await Clients.OthersInGroup(ConversationGroup(id))
            .SendAsync("Typing", new { conversationId = id, senderUserId = userId });
    }

    public static string ConversationGroup(Guid conversationId) => $"conversation:{conversationId}";

    private Guid? ParseGuid(string claimType)
    {
        var value = Context.User?.FindFirstValue(claimType);
        return Guid.TryParse(value, out var id) ? id : null;
    }

    private UserRole? ParseRole()
    {
        var value = Context.User?.FindFirstValue(ClaimTypes.Role)
            ?? Context.User?.FindFirstValue("role");
        return Enum.TryParse<UserRole>(value, true, out var role) ? role : null;
    }
}
