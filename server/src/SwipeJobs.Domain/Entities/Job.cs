using SwipeJobs.Domain.Common;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Domain.Entities;

public class Job : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public string? DisplayTitle { get; set; }
    public string? DisplayCompany { get; set; }
    public string? DisplaySalary { get; set; }
    public string? DisplayLocation { get; set; }
    /// <summary>JSON array of up to 5 card skill labels.</summary>
    public string? DisplaySkillsJson { get; set; }
    public string? DisplaySummary { get; set; }
    public string? Location { get; set; }
    public string? City { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public JobCategory Category { get; set; }
    public JobLevel Level { get; set; } = JobLevel.NotApplicable;
    public bool IsRemote { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsArchived { get; set; }
    public JobLifecycleStatus LifecycleStatus { get; set; } = JobLifecycleStatus.Published;
    public DateTime? PostedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public Guid? CandidateJobId { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    public Guid? PublishedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
    public string? ExternalUrl { get; set; }
    public string? JobImageUrl { get; set; }
    public string? AiGeneratedImageUrl { get; set; }
    /// <summary>SHA-256 fingerprint for deduplication during ingestion.</summary>
    public string? ContentFingerprint { get; set; }
    /// <summary>Stable external key from the originating source (e.g. Telegram message id).</summary>
    public string? ExternalSourceKey { get; set; }

    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid SourceId { get; set; }
    public Source Source { get; set; } = null!;

    public ICollection<JobTag> JobTags { get; set; } = new List<JobTag>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
    public ICollection<SavedJob> SavedByUsers { get; set; } = new List<SavedJob>();
}
