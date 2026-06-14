using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common.Dtos;

public record TelegramIngestMessageDto(
    Guid SourceId,
    string TelegramMessageId,
    string? TelegramMessageUrl,
    string? ChannelName,
    string? ChannelUrl,
    DateTime? PostedAt,
    string RawMessageText,
    IReadOnlyList<string>? RawMediaUrls);

public record IngestionMessageDto(
    Guid Id,
    Guid SourceId,
    string SourceName,
    string ExternalSourceKey,
    string? TelegramMessageId,
    string? TelegramMessageUrl,
    string? ChannelName,
    string? ChannelUrl,
    DateTime? PostedAt,
    string RawMessageText,
    IReadOnlyList<string> RawMediaUrls,
    IngestionMessageStatus Status,
    DateTime CreatedAt);

public record JobCandidateSourceDto(
    Guid MessageId,
    string SourceName,
    string? ChannelName,
    string? TelegramMessageUrl,
    DateTime? PostedAt);

public record JobCandidateDto(
    Guid Id,
    Guid SourceId,
    string SourceName,
    CandidateJobStatus Status,
    string? Title,
    string? CompanyName,
    string? Description,
    string? Location,
    string? City,
    bool IsRemote,
    decimal? SalaryMin,
    decimal? SalaryMax,
    JobCategory Category,
    JobLevel Level,
    string? EmploymentType,
    IReadOnlyList<string> Skills,
    ApplyMethodType ApplyMethod,
    string? ApplyUrl,
    string? ApplyEmail,
    string? ApplyTelegram,
    string? ApplyPhone,
    int ExtractionConfidence,
    int CompletenessScore,
    int TrustScore,
    int SpamScore,
    Guid DuplicateGroupId,
    int SourceCount,
    IReadOnlyList<JobCandidateSourceDto> Sources,
    IngestionMessageDto? PrimaryMessage,
    Guid? PublishedJobId,
    string? RejectedReason,
    DateTime CreatedAt);

public record ModerationQueueDto(
    IReadOnlyList<JobCandidateDto> Items,
    int TotalCount,
    int PendingCount);

public record EditJobCandidateDto(
    string? Title,
    string? CompanyName,
    string? Description,
    string? Location,
    string? City,
    bool? IsRemote,
    decimal? SalaryMin,
    decimal? SalaryMax,
    JobCategory? Category,
    JobLevel? Level,
    string? EmploymentType,
    IReadOnlyList<string>? Skills,
    ApplyMethodType? ApplyMethod,
    string? ApplyUrl,
    string? ApplyEmail,
    string? ApplyTelegram,
    string? ApplyPhone);

public record RejectJobCandidateDto(string Reason);

public record BulkModerationDto(IReadOnlyList<Guid> CandidateIds);

public record IngestionAnalyticsDto(
    int MessagesScanned,
    int JobsDetected,
    int DuplicatesMerged,
    int Approved,
    int Rejected,
    int Published,
    int Expired,
    int Filled,
    double AverageConfidence,
    double AverageTrustScore,
    IReadOnlyList<SourceLeaderboardEntryDto> SourceLeaderboard);

public record SourceLeaderboardEntryDto(
    Guid SourceId,
    string SourceName,
    int MessagesScanned,
    int Published,
    int Approved,
    int Rejected,
    double AverageConfidence,
    int TrustScore);

public record CreateJobReportDto(ReportReason Reason, string? Details);

public record JobReportDto(
    Guid Id,
    Guid JobId,
    string JobTitle,
    ReportReason Reason,
    string? Details,
    JobReportStatus Status,
    DateTime CreatedAt);

public record UpdateJobLifecycleDto(JobLifecycleStatus Status);

public record RegisterTelegramSourceDto(
    string Name,
    string? ChannelName,
    string? ChannelUrl,
    string? ExternalIdentifier,
    int TrustScore = 50,
    int DefaultExpirationDays = 30);
