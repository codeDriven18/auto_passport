using SwipeJobs.Application.Common.Dtos;

namespace SwipeJobs.Application.Modules.Ingestion;

public record ModerationActionResultDto(
    bool Success,
    string? Code,
    string? Message,
    string? Details,
    Guid? CandidateId,
    Guid? JobId,
    string? CandidateStatus);

public record BulkModerationActionResultDto(
    int Approved,
    int Failed,
    IReadOnlyList<ModerationActionResultDto> Results);
