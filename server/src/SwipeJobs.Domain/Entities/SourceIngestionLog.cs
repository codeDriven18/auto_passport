using SwipeJobs.Domain.Common;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Domain.Entities;

public class SourceIngestionLog : BaseEntity
{
    public Guid SourceId { get; set; }
    public Source Source { get; set; } = null!;

    public string Stage { get; set; } = string.Empty;
    public string Level { get; set; } = "Info";
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
}
