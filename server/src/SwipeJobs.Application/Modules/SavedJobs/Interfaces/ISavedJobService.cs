using SwipeJobs.Application.Common.Dtos;

namespace SwipeJobs.Application.Modules.SavedJobs.Interfaces;

public interface ISavedJobService
{
    Task<IReadOnlyList<SavedJobDto>> GetByUserProfileIdAsync(Guid userProfileId, CancellationToken cancellationToken = default);
    Task<SavedJobDto> SaveAsync(CreateSavedJobDto dto, CancellationToken cancellationToken = default);
    Task<bool> UnsaveAsync(Guid id, Guid userProfileId, CancellationToken cancellationToken = default);
    Task<bool> UnsaveByJobAsync(Guid userProfileId, Guid jobId, CancellationToken cancellationToken = default);
}
