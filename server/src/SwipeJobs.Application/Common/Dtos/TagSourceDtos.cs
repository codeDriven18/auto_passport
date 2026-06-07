using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common.Dtos;

public record TagDto(Guid Id, string Name, string? Slug);

public record CreateTagDto(string Name, string? Slug);

public record UpdateTagDto(string Name, string? Slug);

public record SourceDto(Guid Id, string Name, SourceType Type, string? ExternalIdentifier, bool IsActive);

public record CreateSourceDto(string Name, SourceType Type, string? ExternalIdentifier);

public record UpdateSourceDto(string Name, SourceType Type, string? ExternalIdentifier, bool IsActive);
