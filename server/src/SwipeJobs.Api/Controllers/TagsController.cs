using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Modules.Tags.Interfaces;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly ITagService _tagService;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<TagsController> _logger;

    public TagsController(
        ITagService tagService,
        ICurrentUserService currentUser,
        ILogger<TagsController> logger)
    {
        _tagService = tagService;
        _currentUser = currentUser;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var tags = await _tagService.GetAllAsync(cancellationToken);
        return Ok(tags);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var tag = await _tagService.GetByIdAsync(id, cancellationToken);
        return tag is null ? NotFound() : Ok(tag);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateTagDto dto, CancellationToken cancellationToken)
    {
        RequireAdmin("POST /api/tags");
        var tag = await _tagService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = tag.Id }, tag);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTagDto dto, CancellationToken cancellationToken)
    {
        RequireAdmin($"PUT /api/tags/{id}");
        var tag = await _tagService.UpdateAsync(id, dto, cancellationToken);
        return tag is null ? NotFound() : Ok(tag);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        RequireAdmin($"DELETE /api/tags/{id}");
        var deleted = await _tagService.DeleteAsync(id, cancellationToken);
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
                "Unauthorized tag mutation attempt endpoint={Endpoint} userId={UserId} role={Role}",
                endpoint,
                _currentUser.UserId,
                _currentUser.Role);
            throw;
        }
    }
}
