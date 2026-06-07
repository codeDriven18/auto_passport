using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Modules.Tags.Interfaces;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly ITagService _tagService;

    public TagsController(ITagService tagService)
    {
        _tagService = tagService;
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
    public async Task<IActionResult> Create([FromBody] CreateTagDto dto, CancellationToken cancellationToken)
    {
        var tag = await _tagService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = tag.Id }, tag);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTagDto dto, CancellationToken cancellationToken)
    {
        var tag = await _tagService.UpdateAsync(id, dto, cancellationToken);
        return tag is null ? NotFound() : Ok(tag);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _tagService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
