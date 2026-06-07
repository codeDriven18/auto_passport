using SwipeJobs.Domain.Common;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Domain.Entities;

public class Job : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? City { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public JobCategory Category { get; set; }
    public JobLevel Level { get; set; } = JobLevel.NotApplicable;
    public bool IsRemote { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsArchived { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? ExternalUrl { get; set; }

    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid SourceId { get; set; }
    public Source Source { get; set; } = null!;

    public ICollection<JobTag> JobTags { get; set; } = new List<JobTag>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
    public ICollection<SavedJob> SavedByUsers { get; set; } = new List<SavedJob>();
}
