using SwipeJobs.Domain.Common;

namespace SwipeJobs.Domain.Entities;

public class UserInterestProfile : BaseEntity
{
    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;

    public string PreferredCategoriesJson { get; set; } = "{}";
    public string PreferredTechnologiesJson { get; set; } = "{}";
    public string PreferredCitiesJson { get; set; } = "{}";
    public decimal? PreferredSalaryMin { get; set; }
    public decimal? PreferredSalaryMax { get; set; }
    public DateTime LastCalculatedAt { get; set; }
}
