using Microsoft.EntityFrameworkCore;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Infrastructure.Persistence.Repositories;

public class SourceIngestionLogRepository : Repository<SourceIngestionLog>, ISourceIngestionLogRepository
{
    public SourceIngestionLogRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<SourceIngestionLog>> GetRecentBySourceAsync(
        Guid sourceId,
        int limit,
        CancellationToken cancellationToken = default)
        => await DbSet
            .AsNoTracking()
            .Where(l => l.SourceId == sourceId)
            .OrderByDescending(l => l.CreatedAt)
            .Take(Math.Clamp(limit, 1, 200))
            .ToListAsync(cancellationToken);
}
