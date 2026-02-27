using JobAggregator.App.Data;
using JobAggregator.App.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobAggregator.App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SourcesController : ControllerBase
{
    private readonly AppDbContext _db;

    public SourcesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var items = await _db.Sources
            .OrderBy(s => s.Name)
            .Select(s => new { s.Id, s.Name, s.Url })
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SourceDto body)
    {
        if (string.IsNullOrWhiteSpace(body.Name))
        {
            return BadRequest("Name is required.");
        }

        var exists = await _db.Sources.AnyAsync(s => s.Name == body.Name.Trim());
        if (exists)
        {
            return Conflict("Source already exists.");
        }

        var source = new Source
        {
            Name = body.Name.Trim(),
            Url = string.IsNullOrWhiteSpace(body.Url) ? null : body.Url.Trim()
        };

        _db.Sources.Add(source);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = source.Id }, new { source.Id, source.Name, source.Url });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SourceDto body)
    {
        if (string.IsNullOrWhiteSpace(body.Name))
        {
            return BadRequest("Name is required.");
        }

        var source = await _db.Sources.FindAsync(id);
        if (source == null) return NotFound();

        source.Name = body.Name.Trim();
        source.Url = string.IsNullOrWhiteSpace(body.Url) ? null : body.Url.Trim();

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var source = await _db.Sources.FindAsync(id);
        if (source == null) return NotFound();

        _db.Sources.Remove(source);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    public class SourceDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Url { get; set; }
    }
}
