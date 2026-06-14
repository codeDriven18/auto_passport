using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Mapping;
using SwipeJobs.Application.Modules.Ingestion.Services;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

/// <summary>
/// Legacy entry point — routes all ingestion through the candidate pipeline (never direct publish).
/// </summary>
public class JobIngestionService
{
    private readonly IngestionPipelineService _pipeline;

    public JobIngestionService(IngestionPipelineService pipeline)
    {
        _pipeline = pipeline;
    }

    public async Task<(JobCandidateDto? Candidate, bool IsDuplicate)> IngestTelegramAsync(
        TelegramIngestMessageDto dto,
        CancellationToken cancellationToken = default)
    {
        var (candidate, isDuplicate) = await _pipeline.ProcessTelegramMessageAsync(dto, cancellationToken);
        return (IngestionMapper.ToCandidateDto(candidate), isDuplicate);
    }
}
