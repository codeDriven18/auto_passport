using SwipeJobs.Domain.Common;

namespace SwipeJobs.Domain.Entities;

public class SavedJob : BaseEntity
{
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;

    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;

    public Guid JobId { get; set; }
    public Job Job { get; set; } = null!;
}
