using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SwipeJobs.Application.Common.Configuration;
using SwipeJobs.Application.Modules.Ingestion.Interfaces;
using SwipeJobs.Application.Modules.Ingestion.Services;

namespace SwipeJobs.Application;

public static class AiDependencyInjection
{
    public static IServiceCollection AddAiExtraction(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<AiOptions>(configuration.GetSection(AiOptions.SectionName));

        services.AddHttpClient<GeminiExtractionService>(client =>
        {
            client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");
            client.Timeout = TimeSpan.FromSeconds(60);
        });

        services.AddScoped<IAiExtractionService>(sp =>
        {
            var options = configuration.GetSection(AiOptions.SectionName).Get<AiOptions>() ?? new AiOptions();
            var provider = options.Provider?.Trim() ?? "Gemini";

            return provider.Equals("Gemini", StringComparison.OrdinalIgnoreCase)
                ? sp.GetRequiredService<GeminiExtractionService>()
                : throw new InvalidOperationException($"Unsupported AI provider '{provider}'. Only Gemini is configured for Phase 1.");
        });

        return services;
    }
}
