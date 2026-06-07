using Microsoft.EntityFrameworkCore;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Repositories;

public class SourceRepository : Repository<Source>, ISourceRepository
{
    public SourceRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Source>> GetActiveSourcesAsync(CancellationToken cancellationToken = default)
        => await DbSet.AsNoTracking().Where(s => s.IsActive).ToListAsync(cancellationToken);

    public async Task<Source?> GetFirstAsync(CancellationToken cancellationToken = default)
        => await DbSet.AsNoTracking().FirstOrDefaultAsync(cancellationToken);
}
