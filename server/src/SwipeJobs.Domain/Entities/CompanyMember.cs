using SwipeJobs.Domain.Common;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Domain.Entities;

public class CompanyMember : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    /// <summary>Team role for future multi-user employer access.</summary>
    public CompanyMemberRole Role { get; set; } = CompanyMemberRole.Recruiter;
}
