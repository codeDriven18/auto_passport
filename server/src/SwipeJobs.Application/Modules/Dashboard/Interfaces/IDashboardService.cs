using SwipeJobs.Application.Common.Dtos;

namespace SwipeJobs.Application.Modules.Dashboard.Interfaces;

public interface IDashboardService
{
    Task<UserDashboardDto> GetUserDashboardAsync(Guid userProfileId, CancellationToken cancellationToken = default);

    Task<UserDashboardDto> GetMyDashboardAsync(
        Guid userId,
        Guid? profileIdClaim,
        Domain.Enums.UserRole? role,
        CancellationToken cancellationToken = default);

    UserDashboardDto CreateEmptyDashboard(int profileCompletionPercentage = 0);
}
