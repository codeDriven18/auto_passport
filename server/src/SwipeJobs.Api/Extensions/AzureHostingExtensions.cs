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
}
