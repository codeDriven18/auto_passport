using JobAggregator.App.Data;
using JobAggregator.App.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobAggregator.App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TagsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? search)
    {
        var query = _db.Tags.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLowerInvariant();
            query = query.Where(t => t.Name.ToLower().Contains(s));
        }

        var items = await query
            .OrderBy(t => t.Name)
            .Select(t => new { t.Id, t.Name })
            .Take(50)
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TagDto body)
    {
        if (string.IsNullOrWhiteSpace(body.Name))
        {
            return BadRequest("Name is required.");
        }

        var name = body.Name.Trim();
        var exists = await _db.Tags.AnyAsync(t => t.Name == name);
        if (exists)
        {
            return Conflict("Tag already exists.");
        }

        var tag = new Tag { Name = name };
        _db.Tags.Add(tag);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = tag.Id }, new { tag.Id, tag.Name });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] TagDto body)
    {
        if (string.IsNullOrWhiteSpace(body.Name))
        {
            return BadRequest("Name is required.");
        }

        var tag = await _db.Tags.FindAsync(id);
        if (tag == null) return NotFound();

        tag.Name = body.Name.Trim();
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tag = await _db.Tags.FindAsync(id);
        if (tag == null) return NotFound();

        _db.Tags.Remove(tag);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    public class TagDto
    {
        public string Name { get; set; } = string.Empty;
    }
}
