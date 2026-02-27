using System.ComponentModel.DataAnnotations;

namespace JobAggregator.App.Models;

public class UserPreference
{
    [Key]
    public Guid JobId { get; set; }
    public Job Job { get; set; } = null!;

    public bool IsBookmarked { get; set; }
    public bool IsApplied { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime UpdatedAt { get; set; }
}
