using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Modules.Sources.Interfaces;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SourcesController : ControllerBase
{
    private readonly ISourceService _sourceService;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<SourcesController> _logger;

    public SourcesController(
        ISourceService sourceService,
        ICurrentUserService currentUser,
        ILogger<SourcesController> logger)
    {
        _sourceService = sourceService;
        _currentUser = currentUser;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var sources = await _sourceService.GetAllAsync(cancellationToken);
        return Ok(sources);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var source = await _sourceService.GetByIdAsync(id, cancellationToken);
        return source is null ? NotFound() : Ok(source);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateSourceDto dto, CancellationToken cancellationToken)
    {
        RequireAdmin("POST /api/sources");
        var source = await _sourceService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = source.Id }, source);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSourceDto dto, CancellationToken cancellationToken)
    {
        RequireAdmin($"PUT /api/sources/{id}");
        var source = await _sourceService.UpdateAsync(id, dto, cancellationToken);
        return source is null ? NotFound() : Ok(source);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        RequireAdmin($"DELETE /api/sources/{id}");
        var deleted = await _sourceService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    private void RequireAdmin(string endpoint)
    {
        try
        {
            _currentUser.RequireRole(UserRole.Admin);
        }
        catch (UnauthorizedAccessException)
        {
            _logger.LogWarning(
                "Unauthorized source mutation attempt endpoint={Endpoint} userId={UserId} role={Role}",
                endpoint,
                _currentUser.UserId,
                _currentUser.Role);
            throw;
        }
    }
}
