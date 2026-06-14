using SwipeJobs.Domain.Common;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Domain.Entities;

/// <summary>Immutable raw payload from an external source (Telegram, RSS, etc.). Never overwrite original content.</summary>
public class IngestionMessage : BaseEntity
{
    public Guid SourceId { get; set; }
    public Source Source { get; set; } = null!;

    public string ExternalSourceKey { get; set; } = string.Empty;
    public string? TelegramMessageId { get; set; }
    public string? TelegramMessageUrl { get; set; }
    public string? ChannelName { get; set; }
    public string? ChannelUrl { get; set; }
    public DateTime? PostedAt { get; set; }

    /// <summary>Original message text — preserved permanently.</summary>
    public string RawMessageText { get; set; } = string.Empty;

    /// <summary>JSON array of media URLs from the source message.</summary>
    public string? RawMediaUrlsJson { get; set; }

    public IngestionMessageStatus Status { get; set; } = IngestionMessageStatus.Received;
    public string? ProcessingError { get; set; }

    public ICollection<JobCandidateMessage> CandidateLinks { get; set; } = new List<JobCandidateMessage>();
}
