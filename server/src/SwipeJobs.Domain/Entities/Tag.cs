using SwipeJobs.Domain.Common;

namespace SwipeJobs.Domain.Entities;

public class Tag : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }

    public ICollection<JobTag> JobTags { get; set; } = new List<JobTag>();
}
