using SwipeJobs.Domain.Common;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Domain.Entities;

public class Source : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public SourceType Type { get; set; } = SourceType.Manual;
    public string? ExternalIdentifier { get; set; }
    public string? LogoUrl { get; set; }
    /// <summary>0–100 trust score used for display and ingestion prioritization.</summary>
    public int TrustScore { get; set; } = 50;
    public bool IsActive { get; set; } = true;

    public ICollection<Job> Jobs { get; set; } = new List<Job>();
}
