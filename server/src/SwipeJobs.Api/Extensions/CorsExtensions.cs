namespace SwipeJobs.Api.Extensions;

public static class CorsExtensions
{
    public const string CorsPolicyName = "CorsPolicy";

    public static IServiceCollection AddSwipeJobsCors(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        var configuredOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? Array.Empty<string>();

        if (configuredOrigins.Length == 0 && environment.IsDevelopment())
        {
            configuredOrigins =
            [
                "http://localhost:5173",
                "https://localhost:5173",
                "http://127.0.0.1:5173",
                "https://127.0.0.1:5173",
                "http://localhost:4173",
                "http://127.0.0.1:4173",
            ];
        }

        if (configuredOrigins.Length == 0 && environment.IsProduction())
        {
            configuredOrigins =
            [
                "https://swipejobss.netlify.app",
                "http://localhost:5173",
                "https://localhost:5173",
            ];
        }

        services.AddCors(options =>
        {
            options.AddPolicy(CorsPolicyName, policy =>
            {
                policy
                    .SetIsOriginAllowed(origin => IsAllowedOrigin(origin, configuredOrigins))
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .SetPreflightMaxAge(TimeSpan.FromHours(1));
            });
        });

        return services;
    }

    internal static bool IsAllowedOrigin(string origin, IReadOnlyList<string> configuredOrigins)
    {
        if (configuredOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
            return true;

        if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
            return false;

        if (uri.Scheme is not ("http" or "https"))
            return false;

        if (IsLocalDevOrigin(uri))
            return true;

        if (uri.Host.Equals("swipejobss.netlify.app", StringComparison.OrdinalIgnoreCase))
            return true;

        // Netlify production site + deploy previews such as
        // https://6a267b1a1b64858734149e95--swipejobss.netlify.app
        if (uri.Host.EndsWith(".netlify.app", StringComparison.OrdinalIgnoreCase))
            return true;

        return false;
    }

    private static bool IsLocalDevOrigin(Uri uri)
    {
        if (!uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
            && !uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return uri.Port is -1 or 5173 or 4173 or 5123;
    }
}
