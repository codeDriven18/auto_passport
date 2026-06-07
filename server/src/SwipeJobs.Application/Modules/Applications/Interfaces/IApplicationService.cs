using SwipeJobs.Application.Common.Dtos;

namespace SwipeJobs.Application.Modules.Applications.Interfaces;

public interface IApplicationService
{
    Task<IReadOnlyList<ApplicationDto>> GetByUserProfileIdAsync(Guid userProfileId, CancellationToken cancellationToken = default);
    Task<ApplicationDto> ApplyAsync(CreateApplicationDto dto, CancellationToken cancellationToken = default);
    Task<bool> WithdrawAsync(Guid id, Guid userProfileId, CancellationToken cancellationToken = default);
}
