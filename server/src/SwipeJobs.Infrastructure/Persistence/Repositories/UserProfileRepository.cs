using Microsoft.EntityFrameworkCore;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Repositories;

public class UserProfileRepository : Repository<UserProfile>, IUserProfileRepository
{
    public UserProfileRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<UserProfile?> GetByExternalUserIdAsync(string externalUserId, CancellationToken cancellationToken = default)
        => await DbSet
            .Include(u => u.Educations)
            .Include(u => u.Skills)
            .Include(u => u.Experiences)
            .FirstOrDefaultAsync(u => u.ExternalUserId == externalUserId, cancellationToken);

    public async Task<UserProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        => await DbSet
            .Include(u => u.Educations)
            .Include(u => u.Skills)
            .Include(u => u.Experiences)
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);

    public async Task<UserProfile?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
        => await DbSet
            .Include(u => u.Educations)
            .Include(u => u.Skills)
            .Include(u => u.Experiences)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
}
