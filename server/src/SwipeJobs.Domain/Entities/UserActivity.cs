using SwipeJobs.Domain.Common;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Domain.Entities;

public class UserActivity : BaseEntity
{
    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;

    public ActivityType ActivityType { get; set; }
    public Guid? JobId { get; set; }
    public Job? Job { get; set; }
    public Guid? CompanyId { get; set; }
    public Company? Company { get; set; }

    public DateTime OccurredAt { get; set; }
}
