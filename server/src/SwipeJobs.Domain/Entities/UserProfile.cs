using SwipeJobs.Domain.Common;

namespace SwipeJobs.Domain.Entities;

public class UserProfile : BaseEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public string? ExternalUserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Bio { get; set; }
    public string? ResumeUrl { get; set; }
    public string? Location { get; set; }
    public bool IsProfileComplete { get; set; }

    public ICollection<Education> Educations { get; set; } = new List<Education>();
    public ICollection<Skill> Skills { get; set; } = new List<Skill>();
    public ICollection<Experience> Experiences { get; set; } = new List<Experience>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
    public ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
    public ICollection<UserActivity> Activities { get; set; } = new List<UserActivity>();
    public UserInterestProfile? InterestProfile { get; set; }
    public ICollection<CompanyFollow> CompanyFollows { get; set; } = new List<CompanyFollow>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
