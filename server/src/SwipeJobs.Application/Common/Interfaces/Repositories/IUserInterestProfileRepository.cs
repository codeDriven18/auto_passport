using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Common.Interfaces.Repositories;

public interface IUserInterestProfileRepository : IRepository<UserInterestProfile>
{
    Task<UserInterestProfile?> GetByUserProfileIdAsync(Guid userProfileId, CancellationToken cancellationToken = default);
    Task<UserInterestProfile?> GetForUpdateAsync(Guid userProfileId, CancellationToken cancellationToken = default);
}
