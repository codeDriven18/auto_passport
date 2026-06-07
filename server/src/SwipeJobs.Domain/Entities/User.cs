using SwipeJobs.Domain.Common;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.JobSeeker;
    public DateTime? LastLoginAt { get; set; }

    public UserProfile? Profile { get; set; }
    public CompanyMember? CompanyMembership { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
