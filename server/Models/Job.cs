using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobAggregator.App.Models;

public enum JobBranch
{
    Gigs = 1,
    ItJobs = 2
}

public enum EmploymentType
{
    Gig = 1,
    PartTime = 2,
    FullTime = 3,
    Contract = 4,
    Internship = 5
}

public enum JobStatus
{
    Active = 1,
    Archived = 2
}

public class Job
{
    public Guid Id { get; set; }

    [Required]
    public JobBranch Branch { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string CompanyOrPerson { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; }

    public bool IsRemote { get; set; }

    public EmploymentType? EmploymentType { get; set; }

    public int? DurationDays { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? PayMin { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? PayMax { get; set; }

    [MaxLength(10)]
    public string? Currency { get; set; }

    public int? SourceId { get; set; }
    public Source? Source { get; set; }

    [MaxLength(500)]
    public string? ApplyUrl { get; set; }

    [MaxLength(200)]
    public string? Contact { get; set; }

    public DateTime PostedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public JobStatus Status { get; set; }

    public List<JobTag> JobTags { get; set; } = new();
    public UserPreference? UserPreference { get; set; }
}


