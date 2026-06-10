using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Common.Interfaces.Repositories;

public interface IUserProfileRepository : IRepository<UserProfile>
{
    Task<UserProfile?> GetByExternalUserIdAsync(string externalUserId, CancellationToken cancellationToken = default);
    Task<UserProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserProfile?> GetByUserIdForUpdateAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserProfile?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<UserProfile?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken = default);
    Task ReplaceEducationsAsync(Guid profileId, IReadOnlyList<Education> educations, CancellationToken cancellationToken = default);
    Task ReplaceSkillsAsync(Guid profileId, IReadOnlyList<Skill> skills, CancellationToken cancellationToken = default);
    Task ReplaceExperiencesAsync(Guid profileId, IReadOnlyList<Experience> experiences, CancellationToken cancellationToken = default);
}
