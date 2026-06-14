using Microsoft.AspNetCore.Http;

namespace SwipeJobs.Api.Extensions;

public static class AuthHttpContextExtensions
{
    public static string? GetClientIpAddress(this HttpContext context)
    {
        var forwarded = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwarded))
            return forwarded.Split(',')[0].Trim();

        return context.Connection.RemoteIpAddress?.ToString();
    }

    public static string? GetDeviceInfo(this HttpContext context)
    {
        var userAgent = context.Request.Headers.UserAgent.ToString();
        return string.IsNullOrWhiteSpace(userAgent) ? null : userAgent[..Math.Min(userAgent.Length, 512)];
    }
}
