using Microsoft.EntityFrameworkCore;
using Npgsql;
using SwipeJobs.Api.Models;

namespace SwipeJobs.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Forbidden request to {Path}", context.Request.Path);
            await WriteErrorAsync(context, StatusCodes.Status403Forbidden, "Forbidden", "forbidden");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Bad request to {Path}", context.Request.Path);
            await WriteErrorAsync(context, StatusCodes.Status400BadRequest, ex.Message, "bad_request");
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Not found: {Path}", context.Request.Path);
            await WriteErrorAsync(context, StatusCodes.Status404NotFound, "Not found", "not_found");
        }
        catch (DbUpdateException ex)
        {
            LogDatabaseException(context, ex);
            var message = ClassifyDatabaseFailure(ex);
            await WriteErrorAsync(context, StatusCodes.Status500InternalServerError, message, "database_error");
        }
        catch (Exception ex)
        {
            LogDatabaseException(context, ex);
            _logger.LogError(ex, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);
            var message = _environment.IsDevelopment() ? ex.Message : "An unexpected error occurred.";
            await WriteErrorAsync(context, StatusCodes.Status500InternalServerError, message, "internal_error");
        }
    }

    private void LogDatabaseException(HttpContext context, Exception ex)
    {
        for (var current = ex; current is not null; current = current.InnerException)
        {
            switch (current)
            {
                case PostgresException pg:
                    _logger.LogError(
                        pg,
                        "Database failure on {Method} {Path}. SqlState={SqlState} Message={Message}",
                        context.Request.Method,
                        context.Request.Path,
                        pg.SqlState,
                        pg.MessageText);
                    return;
                case NpgsqlException npgsql:
                    _logger.LogError(
                        npgsql,
                        "Npgsql failure on {Method} {Path}. Message={Message}",
                        context.Request.Method,
                        context.Request.Path,
                        npgsql.Message);
                    return;
                case System.Net.Sockets.SocketException socket:
                    _logger.LogError(
                        socket,
                        "Database network failure on {Method} {Path}. SocketError={SocketError} Message={Message}",
                        context.Request.Method,
                        context.Request.Path,
                        socket.SocketErrorCode,
                        socket.Message);
                    return;
            }
        }
    }

    private static string ClassifyDatabaseFailure(Exception ex)
    {
        for (var current = ex; current is not null; current = current.InnerException)
        {
            if (current is PostgresException pg)
            {
                return pg.SqlState switch
                {
                    "28P01" => "Database authentication failed.",
                    "3D000" => "Database does not exist.",
                    "42P01" => "Database schema is missing. Run migrations.",
                    _ => "Database operation failed.",
                };
            }
        }

        return "Database operation failed.";
    }

    private static Task WriteErrorAsync(HttpContext context, int statusCode, string message, string code)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        return context.Response.WriteAsJsonAsync(new ApiErrorResponse(message, code));
    }
}
