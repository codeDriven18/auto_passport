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

    public DashboardController(IDashboardService dashboardService, ICurrentUserService currentUser)
    {
        _dashboardService = dashboardService;
        _currentUser = currentUser;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyDashboard(CancellationToken cancellationToken)
    {
        var dashboard = await _dashboardService.GetUserDashboardAsync(
            _currentUser.GetRequiredProfileId(), cancellationToken);
        return dashboard is null ? NotFound() : Ok(dashboard);
    }
}
