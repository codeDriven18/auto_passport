using JobAggregator.App.Services;
using Microsoft.AspNetCore.Mvc;

namespace JobAggregator.App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly SeedDataService _seed;

    public SeedController(SeedDataService seed)
    {
        _seed = seed;
    }

    [HttpPost]
    public async Task<IActionResult> Post()
    {
        var seeded = await _seed.SeedDemoDataAsync();
        return Ok(new { seeded });
    }
}

