using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common.Dtos;

public record CompanyPortalStatsDto(
    int TotalJobs,
    int ActiveJobs,
    int ArchivedJobs,
    int TotalApplications,
    int NewApplicationsThisWeek,
    CompanyStatus CompanyStatus);

public record PortalCreateJobDto(
    string Title,
    string Description,
    string? Location,
    string? City,
    JobCategory Category,
    JobLevel Level,
    bool IsRemote,
    decimal? SalaryMin,
    decimal? SalaryMax,
    DateTime? ExpiresAt,
    string? ExternalUrl,
    IReadOnlyList<Guid>? TagIds);

public record PortalUpdateJobDto(
    string Title,
    string Description,
    string? Location,
    string? City,
    JobCategory Category,
    JobLevel Level,
    bool IsRemote,
    bool IsActive,
    decimal? SalaryMin,
    decimal? SalaryMax,
    DateTime? ExpiresAt,
    string? ExternalUrl,
    IReadOnlyList<Guid>? TagIds);

public record PortalApplicationDto(
    Guid Id,
    ApplicationStatus Status,
    DateTime AppliedAt,
    Guid JobId,
    string JobTitle,
    Guid UserProfileId,
    string ApplicantName,
    string ApplicantEmail,
    string? ApplicantPhone,
    string? ApplicantProfileImageUrl);

public record PortalUpdateApplicationStatusDto(ApplicationStatus Status);

public record PortalApplicantDetailDto(
    Guid ApplicationId,
    ApplicationStatus Status,
    DateTime AppliedAt,
    Guid JobId,
    string JobTitle,
    Guid UserProfileId,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? Headline,
    string? Bio,
    string? Location,
    string? ProfileImageUrl,
    bool HasResume,
    string? ResumeFileName,
    long? ResumeFileSize,
    DateTime? ResumeUploadedAt,
    IReadOnlyList<SkillDto> Skills,
    IReadOnlyList<ExperienceDto> Experiences,
    IReadOnlyList<EducationDto> Educations);

public record PortalUpdateCompanyDto(
    string Description,
    string Industry,
    string Location,
    string CompanySize,
    string? LogoUrl,
    string? BannerUrl,
    string? Website,
    string? LinkedInUrl);
