using Microsoft.Extensions.Logging;
using SwipeJobs.Application.Modules.Ingestion.Models;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

public interface IJobPreviewService
{
    Task<JobPreviewResult> GenerateAsync(
        JobExtractionResult extraction,
        string? channelHint,
        int extractionConfidence,
        CancellationToken cancellationToken = default);
}

public sealed class JobPreviewService : IJobPreviewService
{
    private readonly IJobExtractionProvider _provider;
    private readonly ILogger<JobPreviewService> _logger;

    public JobPreviewService(IJobExtractionProvider provider, ILogger<JobPreviewService> logger)
    {
        _provider = provider;
        _logger = logger;
    }

    public async Task<JobPreviewResult> GenerateAsync(
        JobExtractionResult extraction,
        string? channelHint,
        int extractionConfidence,
        CancellationToken cancellationToken = default)
    {
        var fallback = JobPreviewFallbackGenerator.Create(extraction, channelHint, extractionConfidence);

        try
        {
            var aiResponse = await _provider.GenerateJobPreviewAsync(
                extraction,
                channelHint,
                extractionConfidence,
                cancellationToken);

            if (aiResponse.Success && aiResponse.Result is not null)
            {
                var sanitized = JobPreviewTextSanitizer.EnforceLimits(aiResponse.Result);
                if (!string.IsNullOrWhiteSpace(sanitized.DisplayTitle) &&
                    !string.IsNullOrWhiteSpace(sanitized.DisplaySummary))
                {
                    _logger.LogInformation(
                        "AI job preview generated via {Provider} in {Ms}ms.",
                        _provider.ProviderName,
                        aiResponse.ProcessingTimeMs);
                    return sanitized;
                }
            }

            _logger.LogWarning(
                "AI job preview unavailable from {Provider}. Using fallback. Error={Error}",
                _provider.ProviderName,
                aiResponse.ErrorMessage);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AI job preview failed via {Provider}. Using fallback.", _provider.ProviderName);
        }

        return fallback;
    }
}
