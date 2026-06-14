using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Modules.Personalization.Interfaces;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ActivitiesController : ControllerBase
{
    private readonly IActivityService _activityService;
    private readonly ICurrentUserService _currentUser;

    public ActivitiesController(IActivityService activityService, ICurrentUserService currentUser)
    {
        _activityService = activityService;
        _currentUser = currentUser;
    }

    [HttpPost]
    public async Task<IActionResult> Record([FromBody] RecordActivityMeDto dto, CancellationToken cancellationToken)
    {
        var activity = await _activityService.RecordAsync(
            new RecordActivityDto(_currentUser.GetRequiredProfileId(), dto.ActivityType, dto.JobId, dto.CompanyId),
            cancellationToken);
        return Ok(activity);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InterestsController : ControllerBase
{
    private readonly IInterestService _interestService;
    private readonly ICurrentUserService _currentUser;

    public InterestsController(IInterestService interestService, ICurrentUserService currentUser)
    {
        _interestService = interestService;
        _currentUser = currentUser;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
    {
        var profileId = _currentUser.GetRequiredProfileId();
        var interests = await _interestService.GetAsync(profileId, cancellationToken)
            ?? await _interestService.RecalculateAsync(profileId, cancellationToken);
        return Ok(interests);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompanyFollowsController : ControllerBase
{
    private readonly ICompanyFollowService _followService;
    private readonly ICurrentUserService _currentUser;

    public CompanyFollowsController(ICompanyFollowService followService, ICurrentUserService currentUser)
    {
        _followService = followService;
        _currentUser = currentUser;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
    {
        var follows = await _followService.GetByUserAsync(_currentUser.GetRequiredProfileId(), cancellationToken);
        return Ok(follows);
    }

    [HttpGet("me/companies/{companyId:guid}")]
    public async Task<IActionResult> IsFollowing(Guid companyId, CancellationToken cancellationToken)
    {
        var following = await _followService.IsFollowingAsync(
            _currentUser.GetRequiredProfileId(), companyId, cancellationToken);
        return Ok(new { following });
    }

    [HttpPost]
    public async Task<IActionResult> Follow([FromBody] FollowCompanyDto dto, CancellationToken cancellationToken)
    {
        var follow = await _followService.FollowAsync(
            new CreateCompanyFollowDto(_currentUser.GetRequiredProfileId(), dto.CompanyId),
            cancellationToken);
        return Ok(follow);
    }

    [HttpDelete("me/companies/{companyId:guid}")]
    public async Task<IActionResult> Unfollow(Guid companyId, CancellationToken cancellationToken)
    {
        var removed = await _followService.UnfollowAsync(
            _currentUser.GetRequiredProfileId(), companyId, cancellationToken);
        return removed ? NoContent() : NotFound();
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ICurrentUserService _currentUser;

    public NotificationsController(INotificationService notificationService, ICurrentUserService currentUser)
    {
        _notificationService = notificationService;
        _currentUser = currentUser;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMine([FromQuery] int limit = 20, CancellationToken cancellationToken = default)
    {
        var items = await _notificationService.GetByUserAsync(
            _currentUser.GetRequiredProfileId(), limit, cancellationToken);
        return Ok(items);
    }

    [HttpGet("me/unread-count")]
    public async Task<IActionResult> UnreadCount(CancellationToken cancellationToken)
    {
        var count = await _notificationService.GetUnreadCountAsync(
            _currentUser.GetRequiredProfileId(), cancellationToken);
        return Ok(new { count });
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken)
    {
        var ok = await _notificationService.MarkReadAsync(
            id, _currentUser.GetRequiredProfileId(), cancellationToken);
        return ok ? NoContent() : NotFound();
    }

    [HttpPatch("me/read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken cancellationToken)
    {
        await _notificationService.MarkAllReadAsync(_currentUser.GetRequiredProfileId(), cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Dismiss(Guid id, CancellationToken cancellationToken)
    {
        var ok = await _notificationService.DismissAsync(
            id, _currentUser.GetRequiredProfileId(), cancellationToken);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("me")]
    public async Task<IActionResult> DismissAll(CancellationToken cancellationToken)
    {
        await _notificationService.DismissAllAsync(_currentUser.GetRequiredProfileId(), cancellationToken);
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
public class TrendingController : ControllerBase
{
    private readonly ITrendingService _trendingService;

    public TrendingController(ITrendingService trendingService)
    {
        _trendingService = trendingService;
    }

    [HttpGet("jobs")]
    public async Task<IActionResult> GetTrendingJobs([FromQuery] int limit = 6, CancellationToken cancellationToken = default)
    {
        var jobs = await _trendingService.GetTrendingJobsAsync(limit, cancellationToken);
        return Ok(jobs);
    }
}
