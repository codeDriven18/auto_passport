using Microsoft.EntityFrameworkCore;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Repositories;

public class CompanyFollowRepository : Repository<CompanyFollow>, ICompanyFollowRepository
{
    public CompanyFollowRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<CompanyFollow>> GetByUserProfileIdAsync(
        Guid userProfileId, CancellationToken cancellationToken = default)
        => await DbSet.AsNoTracking()
            .Include(f => f.Company)
            .Where(f => f.UserProfileId == userProfileId)
            .OrderByDescending(f => f.FollowedAt)
            .ToListAsync(cancellationToken);

    public async Task<CompanyFollow?> GetByUserAndCompanyAsync(
        Guid userProfileId, Guid companyId, CancellationToken cancellationToken = default)
        => await DbSet
            .Include(f => f.Company)
            .FirstOrDefaultAsync(f => f.UserProfileId == userProfileId && f.CompanyId == companyId, cancellationToken);

    public async Task<bool> IsFollowingAsync(
        Guid userProfileId, Guid companyId, CancellationToken cancellationToken = default)
        => await DbSet.AnyAsync(
            f => f.UserProfileId == userProfileId && f.CompanyId == companyId, cancellationToken);

    public async Task<IReadOnlyList<Guid>> GetFollowedCompanyIdsAsync(
        Guid userProfileId, CancellationToken cancellationToken = default)
        => await DbSet.AsNoTracking()
            .Where(f => f.UserProfileId == userProfileId)
            .Select(f => f.CompanyId)
            .ToListAsync(cancellationToken);
}
