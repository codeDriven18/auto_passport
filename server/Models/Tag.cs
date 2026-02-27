using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace JobAggregator.App.Models;

public class Tag
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [JsonIgnore]
    public List<JobTag> JobTags { get; set; } = new();
}

public class JobTag
{
    public Guid JobId { get; set; }
    [JsonIgnore]
    public Job Job { get; set; } = null!;

    public int TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}


