using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Common.Interfaces.Repositories;

public interface ISavedJobRepository : IRepository<SavedJob>
{
    Task<IReadOnlyList<SavedJob>> GetByUserProfileIdAsync(Guid userProfileId, CancellationToken cancellationToken = default);
    Task<SavedJob?> GetByUserAndJobAsync(Guid userProfileId, Guid jobId, CancellationToken cancellationToken = default);
}
