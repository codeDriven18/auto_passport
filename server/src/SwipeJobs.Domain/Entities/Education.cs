using SwipeJobs.Domain.Common;

namespace SwipeJobs.Domain.Entities;

public class Education : BaseEntity
{
    public string Institution { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string? FieldOfStudy { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }

    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;
}
