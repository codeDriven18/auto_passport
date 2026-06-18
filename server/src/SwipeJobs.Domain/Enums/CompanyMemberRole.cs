namespace SwipeJobs.Domain.Enums;

/// <summary>
/// Reserved for multi-user employer teams. Full RBAC ships in a later phase.
/// </summary>
public enum CompanyMemberRole
{
    Owner = 0,
    Admin = 1,
    Recruiter = 2,
    Viewer = 3,
}
