using SwipeJobs.Domain.Common;

namespace SwipeJobs.Domain.Entities;

public class CompanyFollow : BaseEntity
{
    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;

    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public DateTime FollowedAt { get; set; }
}
