using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SwipeJobs.Api.Models;
using SwipeJobs.Infrastructure.Persistence;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<HealthController> _logger;

    public HealthController(AppDbContext dbContext, ILogger<HealthController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var version = Assembly.GetExecutingAssembly().GetName().Version?.ToString(3) ?? "1.0.0";
        var dbStatus = "healthy";

        try
        {
            if (!await _dbContext.Database.CanConnectAsync(cancellationToken))
            {
                dbStatus = "unhealthy";
                _logger.LogError("Database CanConnectAsync returned false.");
            }
        }
        catch (Exception ex)
        {
            dbStatus = "unhealthy";
            LogDatabaseException(ex);
        }

        var apiStatus = dbStatus == "healthy" ? "healthy" : "degraded";

        return Ok(new HealthResponse(
            apiStatus,
            "SwipeJobs API",
            version,
            dbStatus,
            DateTime.UtcNow));
    }

    private void LogDatabaseException(Exception ex)
    {
        for (var current = ex; current is not null; current = current.InnerException)
        {
            switch (current)
            {
                case PostgresException pg:
                    _logger.LogError(
                        pg,
                        "PostgreSQL health check failed. SqlState={SqlState} Severity={Severity} Message={Message}",
                        pg.SqlState,
                        pg.Severity,
                        pg.MessageText);
                    return;
                case NpgsqlException npgsql:
                    _logger.LogError(
                        npgsql,
                        "Npgsql health check failed. Message={Message}",
                        npgsql.Message);
                    return;
                case System.Net.Sockets.SocketException socket:
                    _logger.LogError(
                        socket,
                        "Database network error. SocketError={SocketError} Message={Message}",
                        socket.SocketErrorCode,
                        socket.Message);
                    return;
                case TimeoutException timeout:
                    _logger.LogError(
                        timeout,
                        "Database connection timeout. Message={Message}",
                        timeout.Message);
                    return;
            }
        }

        _logger.LogError(ex, "Database health check failed.");
    }
}
