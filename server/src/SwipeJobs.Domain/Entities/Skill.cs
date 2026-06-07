using SwipeJobs.Domain.Common;

namespace SwipeJobs.Domain.Entities;

public class Skill : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Level { get; set; }

    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;
}
