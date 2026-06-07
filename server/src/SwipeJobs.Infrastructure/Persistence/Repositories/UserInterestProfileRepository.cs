using Microsoft.EntityFrameworkCore;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Repositories;

public class UserInterestProfileRepository : Repository<UserInterestProfile>, IUserInterestProfileRepository
{
    public UserInterestProfileRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<UserInterestProfile?> GetByUserProfileIdAsync(
        Guid userProfileId, CancellationToken cancellationToken = default)
        => await DbSet.AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserProfileId == userProfileId, cancellationToken);

    public async Task<UserInterestProfile?> GetForUpdateAsync(
        Guid userProfileId, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(p => p.UserProfileId == userProfileId, cancellationToken);
}
