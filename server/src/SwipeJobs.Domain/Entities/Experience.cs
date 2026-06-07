using SwipeJobs.Domain.Common;

namespace SwipeJobs.Domain.Entities;

public class Experience : BaseEntity
{
    public string Company { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }

    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;
}
