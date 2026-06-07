using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Modules.Admin.Interfaces;

public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AdminUserDto>> GetUsersAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CompanyDto>> GetCompaniesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<JobDto>> GetJobsAsync(CancellationToken cancellationToken = default);
    Task<JobDto> CreateJobAsync(AdminCreateJobDto dto, CancellationToken cancellationToken = default);
    Task<JobDto?> UpdateJobAsync(Guid id, AdminUpdateJobDto dto, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AdminNotificationDto>> GetNotificationsAsync(int limit, CancellationToken cancellationToken = default);
    Task<NotificationDto> CreateNotificationAsync(CreateAdminNotificationDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteNotificationAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> UpdateUserRoleAsync(Guid userId, UpdateUserRoleDto dto, CancellationToken cancellationToken = default);
    Task<bool> SetCompanyActiveAsync(Guid companyId, bool isActive, CancellationToken cancellationToken = default);
    Task<bool> SetCompanyStatusAsync(Guid companyId, CompanyStatus status, CancellationToken cancellationToken = default);
    Task<bool> SetJobActiveAsync(Guid jobId, bool isActive, CancellationToken cancellationToken = default);
    Task<bool> ArchiveJobAsync(Guid jobId, CancellationToken cancellationToken = default);
    Task<bool> UnarchiveJobAsync(Guid jobId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ApplicationDto>> GetApplicationsAsync(CancellationToken cancellationToken = default);
    Task<PagedResultDto<AuditLogDto>> GetAuditLogsAsync(AuditLogQueryDto query, CancellationToken cancellationToken = default);
    Task<AdminAnalyticsDto> GetAnalyticsAsync(int days, CancellationToken cancellationToken = default);
    Task<AdminSystemHealthDto> GetSystemHealthAsync(CancellationToken cancellationToken = default);
}
