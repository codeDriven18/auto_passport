using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Modules.Dashboard.Interfaces;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(
        IDashboardService dashboardService,
        ICurrentUserService currentUser,
        ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _currentUser = currentUser;
        _logger = logger;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyDashboard(CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId;
        var profileId = _currentUser.ProfileId;
        var role = _currentUser.Role;

        _logger.LogInformation(
            "GET /api/dashboard/me userId={UserId} profileId={ProfileId} role={Role} hasAuth={HasAuth}",
            userId,
            profileId,
            role,
            _currentUser.IsAuthenticated);

        if (!userId.HasValue)
        {
            _logger.LogWarning("GET /api/dashboard/me rejected: missing userId claim");
            return Unauthorized(new { error = "Authentication required.", code = "auth_required" });
        }

        var dashboard = await _dashboardService.GetMyDashboardAsync(
            userId.Value,
            profileId,
            role,
            cancellationToken);

        return Ok(dashboard);
    }
}
