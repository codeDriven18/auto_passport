using System.Globalization;
using System.Text;
using System.Text.Json;
using JobAggregator.App.Data;
using JobAggregator.App.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobAggregator.App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly AppDbContext _db;

    public ExportController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Export(
        [FromQuery] string? format,
        [FromQuery] string? search,
        [FromQuery] string? branch,
        [FromQuery] string? city,
        [FromQuery] string? country,
        [FromQuery] bool? remote,
        [FromQuery] string? employmentType,
        [FromQuery] string? payMin,
        [FromQuery] string? payMax,
        [FromQuery] string? postedFrom,
        [FromQuery] string? postedTo,
        [FromQuery] string? tags,
        [FromQuery] string? tagsMode,
        [FromQuery] int? sourceId,
        [FromQuery] string? status)
    {
        var query = _db.Jobs
            .Include(j => j.Source)
            .Include(j => j.JobTags).ThenInclude(jt => jt.Tag)
            .Include(j => j.UserPreference)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLowerInvariant();
            query = query.Where(j =>
                j.Title.ToLower().Contains(s) ||
                j.CompanyOrPerson.ToLower().Contains(s) ||
                j.Description.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(branch) && Enum.TryParse<JobBranch>(branch, true, out var branchValue))
        {
            query = query.Where(j => j.Branch == branchValue);
        }

        if (!string.IsNullOrWhiteSpace(city))
        {
            var c = city.Trim().ToLowerInvariant();
            query = query.Where(j => j.City != null && j.City.ToLower().Contains(c));
        }

        if (!string.IsNullOrWhiteSpace(country))
        {
            var c = country.Trim().ToLowerInvariant();
            query = query.Where(j => j.Country != null && j.Country.ToLower().Contains(c));
        }

        if (remote.HasValue)
        {
            query = query.Where(j => j.IsRemote == remote.Value);
        }

        if (!string.IsNullOrWhiteSpace(employmentType) &&
            Enum.TryParse<EmploymentType>(employmentType, true, out var employmentValue))
        {
            query = query.Where(j => j.EmploymentType == employmentValue);
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<JobStatus>(status, true, out var statusValue))
        {
            query = query.Where(j => j.Status == statusValue);
        }

        var pMin = ParseDecimal(payMin);
        var pMax = ParseDecimal(payMax);

        if (pMin.HasValue)
        {
            query = query.Where(j => j.PayMax == null || j.PayMax >= pMin.Value);
        }

        if (pMax.HasValue)
        {
            query = query.Where(j => j.PayMin == null || j.PayMin <= pMax.Value);
        }

        if (!string.IsNullOrWhiteSpace(tags))
        {
            var tagList = tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(t => t.ToLowerInvariant())
                .ToList();

            if (tagList.Count > 0)
            {
                var matchAll = string.Equals(tagsMode, "all", StringComparison.OrdinalIgnoreCase);
                if (matchAll)
                {
                    foreach (var tagName in tagList)
                    {
                        var name = tagName;
                        query = query.Where(j => j.JobTags.Any(jt => jt.Tag.Name.ToLower() == name));
                    }
                }
                else
                {
                    query = query.Where(j => j.JobTags.Any(jt => tagList.Contains(jt.Tag.Name.ToLower())));
                }
            }
        }

        var from = ParseDate(postedFrom);
        var to = ParseDate(postedTo);

        if (from.HasValue) query = query.Where(j => j.PostedAt >= from.Value);
        if (to.HasValue) query = query.Where(j => j.PostedAt <= to.Value);

        if (sourceId.HasValue)
        {
            query = query.Where(j => j.SourceId == sourceId.Value);
        }

        var items = await query
            .OrderByDescending(j => j.PostedAt)
            .ThenByDescending(j => j.CreatedAt)
            .ToListAsync();

        var normalized = items.Select(j => new ExportJobDto
        {
            Id = j.Id,
            Branch = j.Branch.ToString(),
            Title = j.Title,
            CompanyOrPerson = j.CompanyOrPerson,
            Description = j.Description,
            City = j.City,
            Country = j.Country,
            IsRemote = j.IsRemote,
            EmploymentType = j.EmploymentType?.ToString(),
            DurationDays = j.DurationDays,
            PayMin = j.PayMin,
            PayMax = j.PayMax,
            Currency = j.Currency,
            PostedAt = j.PostedAt.ToString("yyyy-MM-dd"),
            ApplyUrl = j.ApplyUrl,
            Contact = j.Contact,
            Status = j.Status.ToString(),
            Source = j.Source?.Name,
            Tags = j.JobTags.Select(t => t.Tag.Name).ToList(),
            IsBookmarked = j.UserPreference?.IsBookmarked ?? false,
            IsApplied = j.UserPreference?.IsApplied ?? false,
            Notes = j.UserPreference?.Notes
        }).ToList();

        var fmt = (format ?? "csv").ToLowerInvariant();
        if (fmt == "json")
        {
            var json = JsonSerializer.Serialize(normalized, new JsonSerializerOptions { WriteIndented = true });
            return File(Encoding.UTF8.GetBytes(json), "application/json", "jobs-export.json");
        }

        var csv = BuildCsv(normalized);
        return File(Encoding.UTF8.GetBytes(csv), "text/csv", "jobs-export.csv");
    }

    private static string BuildCsv(List<ExportJobDto> items)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Id,Branch,Title,CompanyOrPerson,Description,City,Country,IsRemote,EmploymentType,DurationDays,PayMin,PayMax,Currency,PostedAt,ApplyUrl,Contact,Status,Source,Tags,IsBookmarked,IsApplied,Notes");

        foreach (var item in items)
        {
            sb.AppendLine(string.Join(",", new[]
            {
                Escape(item.Id.ToString()),
                Escape(item.Branch),
                Escape(item.Title),
                Escape(item.CompanyOrPerson),
                Escape(item.Description),
                Escape(item.City),
                Escape(item.Country),
                Escape(item.IsRemote.ToString()),
                Escape(item.EmploymentType),
                Escape(item.DurationDays?.ToString()),
                Escape(item.PayMin?.ToString(CultureInfo.InvariantCulture)),
                Escape(item.PayMax?.ToString(CultureInfo.InvariantCulture)),
                Escape(item.Currency),
                Escape(item.PostedAt),
                Escape(item.ApplyUrl),
                Escape(item.Contact),
                Escape(item.Status),
                Escape(item.Source),
                Escape(string.Join(";", item.Tags)),
                Escape(item.IsBookmarked.ToString()),
                Escape(item.IsApplied.ToString()),
                Escape(item.Notes)
            }));
        }

        return sb.ToString();
    }

    private static string Escape(string? value)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;
        var shouldQuote = value.Contains(',') || value.Contains('"') || value.Contains('\n');
        var escaped = value.Replace("\"", "\"\"");
        return shouldQuote ? $"\"{escaped}\"" : escaped;
    }

    private static decimal? ParseDecimal(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        if (decimal.TryParse(s.Trim(), NumberStyles.Number, CultureInfo.InvariantCulture, out var d))
        {
            return d;
        }
        return null;
    }

    private static DateTime? ParseDate(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        if (DateTime.TryParse(s.Trim(), CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var dt))
        {
            return dt.Date;
        }
        return null;
    }

    private class ExportJobDto
    {
        public Guid Id { get; set; }
        public string Branch { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string CompanyOrPerson { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? City { get; set; }
        public string? Country { get; set; }
        public bool IsRemote { get; set; }
        public string? EmploymentType { get; set; }
        public int? DurationDays { get; set; }
        public decimal? PayMin { get; set; }
        public decimal? PayMax { get; set; }
        public string? Currency { get; set; }
        public string PostedAt { get; set; } = string.Empty;
        public string? ApplyUrl { get; set; }
        public string? Contact { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Source { get; set; }
        public List<string> Tags { get; set; } = new();
        public bool IsBookmarked { get; set; }
        public bool IsApplied { get; set; }
        public string? Notes { get; set; }
    }
}
