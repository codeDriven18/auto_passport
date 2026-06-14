using SwipeJobs.Domain.Common;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Domain.Entities;

/// <summary>Extracted job awaiting moderation. Never published directly to users.</summary>
public class JobCandidate : BaseEntity
{
    public Guid SourceId { get; set; }
    public Source Source { get; set; } = null!;

    public CandidateJobStatus Status { get; set; } = CandidateJobStatus.PendingReview;

    public string? Title { get; set; }
    public string? CompanyName { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public string? City { get; set; }
    public bool IsRemote { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public JobCategory Category { get; set; } = JobCategory.It;
    public JobLevel Level { get; set; } = JobLevel.NotApplicable;
    public string? EmploymentType { get; set; }

    /// <summary>JSON array of normalized skill names.</summary>
    public string? SkillsJson { get; set; }

    public ApplyMethodType ApplyMethod { get; set; } = ApplyMethodType.Unknown;
    public string? ApplyUrl { get; set; }
    public string? ApplyEmail { get; set; }
    public string? ApplyTelegram { get; set; }
    public string? ApplyPhone { get; set; }

    public int ExtractionConfidence { get; set; }
    public int CompletenessScore { get; set; }
    public int TrustScore { get; set; }
    public int SpamScore { get; set; }

    public string? ContentFingerprint { get; set; }
    public Guid DuplicateGroupId { get; set; }

    public Guid? PublishedJobId { get; set; }
    public Job? PublishedJob { get; set; }

    public Guid? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public Guid? RejectedByUserId { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectedReason { get; set; }
    public Guid? PublishedByUserId { get; set; }
    public DateTime? PublishedAt { get; set; }

    public ICollection<JobCandidateMessage> MessageLinks { get; set; } = new List<JobCandidateMessage>();
}
