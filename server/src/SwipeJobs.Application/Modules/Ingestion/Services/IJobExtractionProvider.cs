using SwipeJobs.Application.Modules.Ingestion.Models;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

public interface IJobExtractionProvider
{
    string ProviderName { get; }

    Task<AiExtractionResponse> ExtractJobAsync(string rawMessage, CancellationToken cancellationToken = default);

    Task<JobPreviewGenerationResponse> GenerateJobPreviewAsync(
        JobExtractionResult extraction,
        string? channelHint,
        int extractionConfidence,
        CancellationToken cancellationToken = default);
}
