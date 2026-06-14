namespace SwipeJobs.Domain.Enums;

public enum AuditAction
{
    UserCreated = 0,
    Login = 1,
    Logout = 2,
    RoleChanged = 3,
    JobCreated = 4,
    JobUpdated = 5,
    JobArchived = 6,
    JobUnarchived = 7,
    JobActivated = 8,
    JobDeactivated = 9,
    CompanyCreated = 10,
    CompanyStatusChanged = 11,
    NotificationCreated = 12,
    AdminAction = 13,
    SessionRevoked = 14,
    RefreshTokenIssued = 15,
    RefreshTokenRotated = 16,
    RefreshTokenRevoked = 17,
    LogoutAll = 18,
}
