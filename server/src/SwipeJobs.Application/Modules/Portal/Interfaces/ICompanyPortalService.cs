using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Modules.Portal.Interfaces;

public interface ICompanyPortalService
{
    Task<CompanyPortalStatsDto> GetStatsAsync(Guid companyId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<JobDto>> GetJobsAsync(Guid companyId, CancellationToken cancellationToken = default);
    Task<JobDto> CreateJobAsync(Guid companyId, PortalCreateJobDto dto, CancellationToken cancellationToken = default);
    Task<JobDto?> UpdateJobAsync(Guid companyId, Guid jobId, PortalUpdateJobDto dto, CancellationToken cancellationToken = default);
    Task<bool> ArchiveJobAsync(Guid companyId, Guid jobId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PortalApplicationDto>> GetApplicationsAsync(Guid companyId, Guid? jobId, CancellationToken cancellationToken = default);
    Task<PortalApplicantDetailDto?> GetApplicantDetailAsync(Guid companyId, Guid applicationId, CancellationToken cancellationToken = default);
    Task<PortalApplicationDto?> UpdateApplicationStatusAsync(
        Guid companyId, Guid applicationId, ApplicationStatus status, CancellationToken cancellationToken = default);
    Task<(Stream Content, string ContentType, string FileName)?> OpenApplicantResumeAsync(
        Guid companyId, Guid applicationId, CancellationToken cancellationToken = default);
    Task<CompanyDto?> GetCompanyAsync(Guid companyId, CancellationToken cancellationToken = default);
    Task<CompanyDto?> UpdateCompanyAsync(Guid companyId, PortalUpdateCompanyDto dto, CancellationToken cancellationToken = default);
}
