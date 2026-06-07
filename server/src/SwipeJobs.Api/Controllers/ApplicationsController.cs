using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Modules.Applications.Interfaces;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _applicationService;
    private readonly ICurrentUserService _currentUser;

    public ApplicationsController(IApplicationService applicationService, ICurrentUserService currentUser)
    {
        _applicationService = applicationService;
        _currentUser = currentUser;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
    {
        var applications = await _applicationService.GetByUserProfileIdAsync(
            _currentUser.GetRequiredProfileId(), cancellationToken);
        return Ok(applications);
    }

    [HttpPost]
    public async Task<IActionResult> Apply([FromBody] ApplyJobDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var application = await _applicationService.ApplyAsync(
                new CreateApplicationDto(_currentUser.GetRequiredProfileId(), dto.JobId),
                cancellationToken);
            return Ok(application);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Withdraw(Guid id, CancellationToken cancellationToken)
    {
        var withdrawn = await _applicationService.WithdrawAsync(
            id, _currentUser.GetRequiredProfileId(), cancellationToken);
        return withdrawn ? NoContent() : NotFound();
    }
}
