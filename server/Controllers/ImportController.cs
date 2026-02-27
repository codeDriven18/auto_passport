using JobAggregator.App.Services;
using Microsoft.AspNetCore.Mvc;

namespace JobAggregator.App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImportController : ControllerBase
{
    private readonly ImportService _import;

    public ImportController(ImportService import)
    {
        _import = import;
    }

    [HttpPost]
    public async Task<IActionResult> Import([FromForm] IFormFile file, [FromQuery] string? format)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File is required.");
        }

        using var stream = file.OpenReadStream();
        var result = await _import.ImportAsync(stream, file.FileName, file.ContentType, format);
        return Ok(result);
    }
}

