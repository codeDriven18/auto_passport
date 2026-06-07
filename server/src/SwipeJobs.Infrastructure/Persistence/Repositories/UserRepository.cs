using Microsoft.EntityFrameworkCore;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(u => u.Email == email.ToLower(), cancellationToken);

    public async Task<User?> GetByIdWithProfileAsync(Guid id, CancellationToken cancellationToken = default)
        => await DbSet
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public async Task<User?> GetByIdWithMembershipAsync(Guid id, CancellationToken cancellationToken = default)
        => await DbSet
            .Include(u => u.Profile)
            .Include(u => u.CompanyMembership)
                .ThenInclude(m => m!.Company)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public async Task<IReadOnlyList<User>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default)
        => await DbSet
            .AsNoTracking()
            .Include(u => u.Profile)
            .Include(u => u.CompanyMembership)
                .ThenInclude(m => m!.Company)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(cancellationToken);
}
