using Microsoft.EntityFrameworkCore;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Repositories;

public class CompanyRepository : Repository<Company>, ICompanyRepository
{
    public CompanyRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<Company?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
        => await DbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Slug == slug && c.IsActive && c.Status == Domain.Enums.CompanyStatus.Approved, cancellationToken);

    public async Task<IReadOnlyList<Company>> GetAllActiveAsync(CancellationToken cancellationToken = default)
        => await DbSet
            .AsNoTracking()
            .Where(c => c.IsActive && c.Status == Domain.Enums.CompanyStatus.Approved)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Company>> GetByStatusAsync(
        Domain.Enums.CompanyStatus status, CancellationToken cancellationToken = default)
        => await DbSet
            .AsNoTracking()
            .Where(c => c.Status == status)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<int> CountOpenJobsAsync(Guid companyId, CancellationToken cancellationToken = default)
        => await Context.Jobs.CountAsync(j => j.CompanyId == companyId && j.IsActive, cancellationToken);
}
