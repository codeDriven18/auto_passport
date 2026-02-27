using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace JobAggregator.App.Models;

public class Source
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Url { get; set; }

    [JsonIgnore]
    public List<Job> Jobs { get; set; } = new();
}


