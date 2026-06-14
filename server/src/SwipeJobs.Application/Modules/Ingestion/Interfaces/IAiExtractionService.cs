using SwipeJobs.Application.Modules.Ingestion.Models;

namespace SwipeJobs.Application.Modules.Ingestion.Interfaces;

public interface IAiExtractionService
{
    Task<AiExtractionResponse> ExtractJobAsync(string rawMessage, CancellationToken cancellationToken = default);
}
