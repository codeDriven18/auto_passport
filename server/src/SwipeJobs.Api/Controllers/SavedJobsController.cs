using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Modules.SavedJobs.Interfaces;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SavedJobsController : ControllerBase
{
    private readonly ISavedJobService _savedJobService;
    private readonly ICurrentUserService _currentUser;

    public SavedJobsController(ISavedJobService savedJobService, ICurrentUserService currentUser)
    {
        _savedJobService = savedJobService;
        _currentUser = currentUser;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
    {
        var saved = await _savedJobService.GetByUserProfileIdAsync(
            _currentUser.GetRequiredProfileId(), cancellationToken);
        return Ok(saved);
    }

    [HttpPost]
    public async Task<IActionResult> Save([FromBody] SaveJobDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var saved = await _savedJobService.SaveAsync(
                new CreateSavedJobDto(_currentUser.GetRequiredProfileId(), dto.JobId),
                cancellationToken);
            return Ok(saved);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Unsave(Guid id, CancellationToken cancellationToken)
    {
        var removed = await _savedJobService.UnsaveAsync(
            id, _currentUser.GetRequiredProfileId(), cancellationToken);
        return removed ? NoContent() : NotFound();
    }

    [HttpDelete("by-job/{jobId:guid}")]
    public async Task<IActionResult> UnsaveByJob(Guid jobId, CancellationToken cancellationToken)
    {
        var removed = await _savedJobService.UnsaveByJobAsync(
            _currentUser.GetRequiredProfileId(), jobId, cancellationToken);
        return removed ? NoContent() : NotFound();
    }
}
