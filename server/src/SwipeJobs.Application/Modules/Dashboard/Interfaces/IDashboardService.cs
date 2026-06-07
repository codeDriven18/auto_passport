using SwipeJobs.Application.Common.Dtos;

namespace SwipeJobs.Application.Modules.Dashboard.Interfaces;

public interface IDashboardService
{
    Task<UserDashboardDto?> GetUserDashboardAsync(Guid userProfileId, CancellationToken cancellationToken = default);
}
