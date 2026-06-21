using System.Diagnostics;
using System.Text.Json;
using SwipeJobs.Application.Common.Performance;

namespace SwipeJobs.Api.Middleware;

/// <summary>
/// Adds X-SwipeJobs-Perf response header with per-request timing breakdown when SWIPEJOBS_PERF=1.
/// Timings are captured in OnStarting (after handler work, before bytes are sent).
/// </summary>
public sealed class RequestPerformanceMiddleware
{
    private readonly RequestDelegate _next;

    public RequestPerformanceMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var started = Stopwatch.GetTimestamp();
        using var scope = RequestPerformanceTracker.BeginScope();

        context.Response.OnStarting(() =>
        {
            var apiMs = (long)Stopwatch.GetElapsedTime(started).TotalMilliseconds;
            var tracker = RequestPerformanceTracker.CurrentTracker;
            var dbMs = tracker?.DatabaseMs ?? 0;
            var storageMs = tracker?.StorageMs ?? 0;
            var appMs = Math.Max(0, apiMs - dbMs - storageMs);

            var payload = JsonSerializer.Serialize(new
            {
                apiMs,
                dbMs,
                storageMs,
                appMs,
                path = context.Request.Path.Value,
            });

            context.Response.Headers["X-SwipeJobs-Perf"] = payload;
            context.Response.Headers["Server-Timing"] =
                $"api;dur={apiMs}, db;dur={dbMs}, storage;dur={storageMs}, app;dur={appMs}";
            return Task.CompletedTask;
        });

        await _next(context);
    }
}
