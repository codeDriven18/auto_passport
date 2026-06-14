using SwipeJobs.Domain.Common;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Domain.Entities;

public class Source : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public SourceType Type { get; set; } = SourceType.Manual;
    public string? ExternalIdentifier { get; set; }
    public string? ChannelName { get; set; }
    public string? ChannelUrl { get; set; }
    public string? LogoUrl { get; set; }
    /// <summary>0–100 trust score used for display and ingestion prioritization.</summary>
    public int TrustScore { get; set; } = 50;
    public int DefaultExpirationDays { get; set; } = 30;
    public bool IngestionEnabled { get; set; } = true;
    public SourceMonitorStatus MonitorStatus { get; set; } = SourceMonitorStatus.Active;
    public DateTime? SourceLastCheckedAt { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Job> Jobs { get; set; } = new List<Job>();
    public ICollection<IngestionMessage> IngestionMessages { get; set; } = new List<IngestionMessage>();
    public ICollection<JobCandidate> JobCandidates { get; set; } = new List<JobCandidate>();
}
