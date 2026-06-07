using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Modules.Sources.Interfaces;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SourcesController : ControllerBase
{
    private readonly ISourceService _sourceService;

    public SourcesController(ISourceService sourceService)
    {
        _sourceService = sourceService;
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
    public async Task<IActionResult> Create([FromBody] CreateSourceDto dto, CancellationToken cancellationToken)
    {
        var source = await _sourceService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = source.Id }, source);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSourceDto dto, CancellationToken cancellationToken)
    {
        var source = await _sourceService.UpdateAsync(id, dto, cancellationToken);
        return source is null ? NotFound() : Ok(source);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _sourceService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
