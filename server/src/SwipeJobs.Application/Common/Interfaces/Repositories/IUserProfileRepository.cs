using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Common.Interfaces.Repositories;

public interface IUserProfileRepository : IRepository<UserProfile>
{
    Task<UserProfile?> GetByExternalUserIdAsync(string externalUserId, CancellationToken cancellationToken = default);
    Task<UserProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserProfile?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}
