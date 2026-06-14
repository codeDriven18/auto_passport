using SwipeJobs.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;
namespace SwipeJobs.Application.Modules.Ingestion.Services;

public interface ISourceIngestionLogger
{
    Task LogAsync(
        Guid sourceId,
        string stage,
        string level,
        string message,
        string? details = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SourceIngestionLog>> GetRecentAsync(
        Guid sourceId,
        int limit = 50,
        CancellationToken cancellationToken = default);
}

public class SourceIngestionLogger : ISourceIngestionLogger
{
    private readonly ISourceIngestionLogRepository _logRepository;
    private readonly ILogger<SourceIngestionLogger> _logger;

    public SourceIngestionLogger(
        ISourceIngestionLogRepository logRepository,
        ILogger<SourceIngestionLogger> logger)
    {
        _logRepository = logRepository;
        _logger = logger;
    }

    public async Task LogAsync(
        Guid sourceId,
        string stage,
        string level,
        string message,
        string? details = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Ingestion [{Level}] sourceId={SourceId} stage={Stage} message={Message} details={Details}",
            level,
            sourceId,
            stage,
            message,
            details);

        await _logRepository.AddAsync(new SourceIngestionLog
        {
            SourceId = sourceId,
            Stage = stage,
            Level = level,
            Message = message,
            Details = details,
        }, cancellationToken);
    }

    public Task<IReadOnlyList<SourceIngestionLog>> GetRecentAsync(
        Guid sourceId,
        int limit = 50,
        CancellationToken cancellationToken = default)
        => _logRepository.GetRecentBySourceAsync(sourceId, limit, cancellationToken);
}
