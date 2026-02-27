using JobAggregator.App.Services;
using Microsoft.AspNetCore.Mvc;

namespace JobAggregator.App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly StatsService _stats;

    public StatsController(StatsService stats)
    {
        _stats = stats;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> Summary()
    {
        var result = await _stats.GetSummaryAsync();
        return Ok(result);
    }

    [HttpGet("timeseries")]
    public async Task<IActionResult> TimeSeries([FromQuery] int days = 30)
    {
        var result = await _stats.GetTimeSeriesAsync(days);
        return Ok(result);
    }
}
