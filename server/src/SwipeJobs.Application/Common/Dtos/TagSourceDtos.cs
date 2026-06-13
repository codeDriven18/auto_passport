using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common.Dtos;

public record TagDto(Guid Id, string Name, string? Slug);

public record CreateTagDto(string Name, string? Slug);

public record UpdateTagDto(string Name, string? Slug);

public record SourceDto(
    Guid Id,
    string Name,
    SourceType Type,
    string? ExternalIdentifier,
    string? LogoUrl,
    int TrustScore,
    SourceTrustLevel TrustLevel,
    bool IsActive);

public record CreateSourceDto(
    string Name,
    SourceType Type,
    string? ExternalIdentifier,
    string? LogoUrl,
    int TrustScore = 50);

public record UpdateSourceDto(
    string Name,
    SourceType Type,
    string? ExternalIdentifier,
    string? LogoUrl,
    int TrustScore,
    bool IsActive);

/// <summary>Normalized job payload for external ingestion pipelines (Telegram, APIs).</summary>
public record IngestionJobDto(
    string Title,
    string Description,
    string CompanyName,
    string? CompanySlug,
    string? Location,
    string? City,
    JobCategory Category,
    JobLevel Level,
    bool IsRemote,
    decimal? SalaryMin,
    decimal? SalaryMax,
    string? ExternalUrl,
    string? JobImageUrl,
    string? ExternalSourceKey,
    Guid SourceId,
    IReadOnlyList<string>? TagNames);
