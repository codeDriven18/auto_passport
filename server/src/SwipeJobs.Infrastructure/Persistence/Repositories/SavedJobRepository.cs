using Microsoft.EntityFrameworkCore;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Repositories;

public class SavedJobRepository : Repository<SavedJob>, ISavedJobRepository
{
    public SavedJobRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<SavedJob>> GetByUserProfileIdAsync(Guid userProfileId, CancellationToken cancellationToken = default)
        => await DbSet
            .AsNoTracking()
            .Include(s => s.Job)
                .ThenInclude(j => j!.Company)
            .Where(s => s.UserProfileId == userProfileId)
            .OrderByDescending(s => s.SavedAt)
            .ToListAsync(cancellationToken);

    public async Task<SavedJob?> GetByUserAndJobAsync(Guid userProfileId, Guid jobId, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(s => s.UserProfileId == userProfileId && s.JobId == jobId, cancellationToken);
}
