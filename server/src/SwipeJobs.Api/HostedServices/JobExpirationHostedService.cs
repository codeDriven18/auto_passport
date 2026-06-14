using SwipeJobs.Application.Modules.Ingestion.Services;

namespace SwipeJobs.Api.HostedServices;

public class JobExpirationHostedService : BackgroundService
{
    private readonly IServiceProvider _services;

    public JobExpirationHostedService(IServiceProvider services)
    {
        _services = services;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _services.CreateScope();
                var lifecycle = scope.ServiceProvider.GetRequiredService<IJobLifecycleService>();
                await lifecycle.ExpireDueJobsAsync(stoppingToken);
            }
            catch
            {
                /* logged by host */
            }

            await Task.Delay(TimeSpan.FromHours(6), stoppingToken);
        }
    }
}
