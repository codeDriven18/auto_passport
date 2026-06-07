using SwipeJobs.Domain.Common;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Domain.Entities;

public class Source : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public SourceType Type { get; set; } = SourceType.Manual;
    public string? ExternalIdentifier { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Job> Jobs { get; set; } = new List<Job>();
}
