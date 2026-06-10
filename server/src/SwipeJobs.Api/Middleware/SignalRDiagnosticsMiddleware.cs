using System.Security.Claims;

namespace SwipeJobs.Api.Middleware;

public sealed class SignalRDiagnosticsMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SignalRDiagnosticsMiddleware> _logger;

    public SignalRDiagnosticsMiddleware(RequestDelegate next, ILogger<SignalRDiagnosticsMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments("/hubs", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        var origin = context.Request.Headers.Origin.ToString();
        var requestedHeaders = context.Request.Headers.AccessControlRequestHeaders.ToString();
        var isPreflight = HttpMethods.IsOptions(context.Request.Method);

        _logger.LogWarning(
            "SignalR request: {Method} {Path} Origin={Origin} Preflight={Preflight} RequestedHeaders={RequestedHeaders} HasAccessToken={HasAccessToken}",
            context.Request.Method,
            context.Request.Path,
            string.IsNullOrEmpty(origin) ? "(none)" : origin,
            isPreflight,
            string.IsNullOrEmpty(requestedHeaders) ? "(none)" : requestedHeaders,
            context.Request.Query.ContainsKey("access_token"));

        try
        {
            await _next(context);
        }
        finally
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? context.User.FindFirstValue("sub");
            var profileId = context.User.FindFirstValue("profileId");

            _logger.LogWarning(
                "SignalR response: {Method} {Path} Status={StatusCode} Authenticated={Authenticated} UserId={UserId} ProfileId={ProfileId} ResponseHeaders={AllowHeaders}",
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                context.User.Identity?.IsAuthenticated ?? false,
                userId ?? "(none)",
                profileId ?? "(none)",
                context.Response.Headers.AccessControlAllowHeaders.ToString());
        }
    }
}
