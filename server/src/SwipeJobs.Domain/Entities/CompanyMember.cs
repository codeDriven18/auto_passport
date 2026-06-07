using SwipeJobs.Domain.Common;

namespace SwipeJobs.Domain.Entities;

public class CompanyMember : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;
}
