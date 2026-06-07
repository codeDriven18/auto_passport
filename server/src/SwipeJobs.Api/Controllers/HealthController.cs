using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwipeJobs.Api.Models;
using SwipeJobs.Infrastructure.Persistence;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public HealthController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var version = Assembly.GetExecutingAssembly().GetName().Version?.ToString(3) ?? "1.0.0";
        var dbStatus = "healthy";

        try
        {
            if (!await _dbContext.Database.CanConnectAsync(cancellationToken))
                dbStatus = "unhealthy";
        }
        catch
        {
            dbStatus = "unhealthy";
        }

        var apiStatus = dbStatus == "healthy" ? "healthy" : "degraded";

        return Ok(new HealthResponse(
            apiStatus,
            "SwipeJobs API",
            version,
            dbStatus,
            DateTime.UtcNow));
    }
}
