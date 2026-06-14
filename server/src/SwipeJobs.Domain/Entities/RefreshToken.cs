using SwipeJobs.Domain.Common;

namespace SwipeJobs.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? CreatedByIp { get; set; }
    public string? RevokedByIp { get; set; }
    public string? DeviceInfo { get; set; }
    public bool IsRememberMe { get; set; }
    public DateTime LastActivityAt { get; set; }
}
