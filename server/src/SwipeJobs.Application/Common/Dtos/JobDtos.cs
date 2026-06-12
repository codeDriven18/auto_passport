using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common.Dtos;

public record JobDto(
    Guid Id,
    string Title,
    string Description,
    Guid CompanyId,
    string Company,
    string? CompanyLogoUrl,
    string? CompanySlug,
    string? Location,
    string? City,
    JobCategory Category,
    JobLevel Level,
    bool IsRemote,
    bool IsActive,
    bool IsArchived,
    decimal? SalaryMin,
    decimal? SalaryMax,
    DateTime? ExpiresAt,
    string? ExternalUrl,
    Guid SourceId,
    string? SourceName,
    IReadOnlyList<TagDto> Tags,
    IReadOnlyList<string> TrendingBadges,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record CreateJobDto(
    string Title,
    string Description,
    Guid CompanyId,
    string? Location,
    string? City,
    JobCategory Category,
    JobLevel Level,
    bool IsRemote,
    decimal? SalaryMin,
    decimal? SalaryMax,
    DateTime? ExpiresAt,
    string? ExternalUrl,
    Guid SourceId,
    IReadOnlyList<Guid>? TagIds);

public record UpdateJobDto(
    string Title,
    string Description,
    Guid CompanyId,
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
    Guid SourceId,
    IReadOnlyList<Guid>? TagIds);

public record JobQueryDto(
    string? Search,
    int Page = 1,
    int PageSize = 10,
    string SortBy = "createdAt",
    string SortOrder = "desc",
    JobCategory? Category = null,
    string? City = null,
    bool? IsRemote = null,
    decimal? SalaryMin = null,
    string? Tags = null,
    Guid? CompanyId = null,
    string? CompanySlug = null);
