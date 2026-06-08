namespace SwipeJobs.Api.Extensions;

public static class AzureHostingExtensions
{
    public static void ConfigureAzureListening(this WebApplicationBuilder builder)
    {
        var port = Environment.GetEnvironmentVariable("PORT")
            ?? Environment.GetEnvironmentVariable("WEBSITES_PORT")
            ?? "8080";

        builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
    }

    public static void ScheduleDatabaseInitialization(this WebApplication app)
    {
        app.Lifetime.ApplicationStarted.Register(() =>
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    await app.InitializeDatabaseAsync();
                }
                catch (Exception ex)
                {
                    app.Logger.LogError(ex, "Background database initialization failed.");
                }
            });
        });
    }

    public static IApplicationBuilder UseSwipeJobsEarlyCors(this IApplicationBuilder app)
    {
        return app.Use(async (context, next) =>
        {
            var origin = context.Request.Headers.Origin.ToString();

            if (!string.IsNullOrEmpty(origin) && CorsExtensions.IsAllowedOrigin(origin, []))
            {
                context.Response.OnStarting(() =>
                {
                    if (!context.Response.Headers.ContainsKey("Access-Control-Allow-Origin"))
                    {
                        context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                        context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                        context.Response.Headers.Vary = "Origin";
                    }

                    return Task.CompletedTask;
                });
            }

            if (HttpMethods.IsOptions(context.Request.Method)
                && !string.IsNullOrEmpty(origin)
                && CorsExtensions.IsAllowedOrigin(origin, []))
            {
                context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                context.Response.Headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
                context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
                context.Response.StatusCode = StatusCodes.Status204NoContent;
                return;
            }

            await next(context);
        });
    }
}
