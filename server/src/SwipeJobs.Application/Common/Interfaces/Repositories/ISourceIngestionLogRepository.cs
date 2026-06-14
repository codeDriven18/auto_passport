using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Common.Interfaces.Repositories;

public interface ISourceIngestionLogRepository : IRepository<SourceIngestionLog>
{
    Task<IReadOnlyList<SourceIngestionLog>> GetRecentBySourceAsync(
        Guid sourceId,
        int limit,
        CancellationToken cancellationToken = default);
}

public record SourceMetricsSnapshot(
    Guid SourceId,
    int MessagesScanned,
    int JobsExtracted,
    int PendingModeration);
