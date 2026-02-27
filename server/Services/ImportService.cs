using System.Globalization;
using System.Text;
using System.Text.Json;
using JobAggregator.App.Data;
using JobAggregator.App.Models;
using Microsoft.EntityFrameworkCore;

namespace JobAggregator.App.Services;

public class ImportService
{
    private readonly AppDbContext _db;

    public ImportService(AppDbContext db)
    {
        _db = db;
    }

    public class ImportResult
    {
        public int Inserted { get; set; }
        public int Updated { get; set; }
        public List<RowError> Errors { get; set; } = new();
        public int Failed => Errors.Count;
    }

    public class RowError
    {
        public int RowNumber { get; set; }
        public List<string> Messages { get; set; } = new();
    }

    public async Task<ImportResult> ImportAsync(Stream stream, string fileName, string? contentType, string? format)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        var fmt = (format ?? string.Empty).ToLowerInvariant();

        if (fmt == "json" || ext == ".json" || (contentType?.Contains("json") ?? false))
        {
            return await ImportJsonAsync(stream);
        }

        return await ImportCsvAsync(stream);
    }

    private async Task<ImportResult> ImportJsonAsync(Stream stream)
    {
        var result = new ImportResult();

        using var reader = new StreamReader(stream, Encoding.UTF8);
        var json = await reader.ReadToEndAsync();

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        List<ImportJobDto>? items;
        try
        {
            items = JsonSerializer.Deserialize<List<ImportJobDto>>(json, options);
        }
        catch (Exception ex)
        {
            result.Errors.Add(new RowError { RowNumber = 0, Messages = new List<string> { "JSON parse error: " + ex.Message } });
            return result;
        }

        if (items == null) return result;

        var row = 1;
        foreach (var dto in items)
        {
            await ImportRowAsync(dto, row++, result);
        }

        await _db.SaveChangesAsync();
        return result;
    }

    private async Task<ImportResult> ImportCsvAsync(Stream stream)
    {
        var result = new ImportResult();

        using var reader = new StreamReader(stream, Encoding.UTF8);
        var headerLine = await reader.ReadLineAsync();
        var lineNumber = 1;

        string[] header;
        if (!string.IsNullOrWhiteSpace(headerLine) && headerLine.ToLowerInvariant().Contains("title"))
        {
            header = headerLine.Split(',').Select(x => x.Trim()).ToArray();
        }
        else
        {
            header = new[]
            {
                "Id","Branch","Title","CompanyOrPerson","Description","City","Country","IsRemote","EmploymentType",
                "DurationDays","PayMin","PayMax","Currency","PostedAt","ApplyUrl","Contact","Status","Source","Tags"
            };

            if (!string.IsNullOrWhiteSpace(headerLine))
            {
                await ImportCsvLineAsync(header, headerLine, lineNumber, result);
            }
        }

        string? line;
        while ((line = await reader.ReadLineAsync()) != null)
        {
            lineNumber++;
            if (string.IsNullOrWhiteSpace(line)) continue;
            await ImportCsvLineAsync(header, line, lineNumber, result);
        }

        await _db.SaveChangesAsync();
        return result;
    }

    private async Task ImportCsvLineAsync(string[] header, string line, int lineNumber, ImportResult result)
    {
        var cols = line.Split(',');

        string Get(string name)
        {
            var idx = Array.FindIndex(header, h => string.Equals(h, name, StringComparison.OrdinalIgnoreCase));
            if (idx < 0 || idx >= cols.Length) return string.Empty;
            return cols[idx].Trim();
        }

        var dto = new ImportJobDto
        {
            Id = Get("Id"),
            Branch = Get("Branch"),
            Title = Get("Title"),
            CompanyOrPerson = Get("CompanyOrPerson"),
            Description = Get("Description"),
            City = Get("City"),
            Country = Get("Country"),
            IsRemote = Get("IsRemote"),
            EmploymentType = Get("EmploymentType"),
            DurationDays = Get("DurationDays"),
            PayMin = Get("PayMin"),
            PayMax = Get("PayMax"),
            Currency = Get("Currency"),
            PostedAt = Get("PostedAt"),
            ApplyUrl = Get("ApplyUrl"),
            Contact = Get("Contact"),
            Status = Get("Status"),
            Source = Get("Source"),
            Tags = Get("Tags")
        };

        await ImportRowAsync(dto, lineNumber, result);
    }

    private async Task ImportRowAsync(ImportJobDto dto, int rowNumber, ImportResult result)
    {
        var errors = Validate(dto);
        if (errors.Count > 0)
        {
            result.Errors.Add(new RowError { RowNumber = rowNumber, Messages = errors });
            return;
        }

        try
        {
            await UpsertFromDtoAsync(dto, result);
        }
        catch (Exception ex)
        {
            result.Errors.Add(new RowError { RowNumber = rowNumber, Messages = new List<string> { ex.Message } });
        }
    }

    private List<string> Validate(ImportJobDto dto)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.Title)) errors.Add("Title is required.");
        if (string.IsNullOrWhiteSpace(dto.CompanyOrPerson)) errors.Add("CompanyOrPerson is required.");
        if (string.IsNullOrWhiteSpace(dto.Description)) errors.Add("Description is required.");

        var branch = ParseBranch(dto.Branch);
        if (branch == null) errors.Add("Branch must be Gigs or ItJobs.");

        if (branch == JobBranch.Gigs && !int.TryParse(dto.DurationDays, out var duration))
        {
            errors.Add("DurationDays is required for gigs.");
        }

        if (branch == JobBranch.ItJobs && !TryParseEmploymentType(dto.EmploymentType, out _))
        {
            errors.Add("EmploymentType is required for IT jobs.");
        }

        return errors;
    }

    private async Task UpsertFromDtoAsync(ImportJobDto dto, ImportResult result)
    {
        var now = DateTime.UtcNow;

        Job? job = null;
        if (!string.IsNullOrWhiteSpace(dto.Id) && Guid.TryParse(dto.Id, out var id))
        {
            job = await _db.Jobs
                .Include(j => j.JobTags)
                .FirstOrDefaultAsync(j => j.Id == id);
        }

        if (job == null)
        {
            job = new Job
            {
                Id = Guid.NewGuid(),
                CreatedAt = now,
                UpdatedAt = now
            };
            _db.Jobs.Add(job);
            result.Inserted++;
        }
        else
        {
            job.UpdatedAt = now;
            result.Updated++;
        }

        job.Branch = ParseBranch(dto.Branch) ?? JobBranch.ItJobs;
        job.Title = dto.Title?.Trim() ?? "";
        job.CompanyOrPerson = dto.CompanyOrPerson?.Trim() ?? "";
        job.Description = dto.Description?.Trim() ?? "";
        job.City = Normalize(dto.City);
        job.Country = Normalize(dto.Country);
        job.IsRemote = bool.TryParse(dto.IsRemote, out var ir) && ir;
        job.EmploymentType = TryParseEmploymentType(dto.EmploymentType, out var et)
            ? et
            : job.Branch == JobBranch.Gigs ? EmploymentType.Gig : null;
        job.DurationDays = int.TryParse(dto.DurationDays, out var duration) ? duration : null;
        job.PayMin = ParseDecimal(dto.PayMin);
        job.PayMax = ParseDecimal(dto.PayMax);
        job.Currency = Normalize(dto.Currency);
        job.ApplyUrl = Normalize(dto.ApplyUrl);
        job.Contact = Normalize(dto.Contact);
        job.PostedAt = ParseDate(dto.PostedAt) ?? now.Date;
        job.Status = TryParseStatus(dto.Status, out var status) ? status : JobStatus.Active;

        if (!string.IsNullOrWhiteSpace(dto.Source))
        {
            var sourceName = dto.Source.Trim();
            var source = await _db.Sources.FirstOrDefaultAsync(s => s.Name == sourceName);
            if (source == null)
            {
                source = new Source { Name = sourceName };
                _db.Sources.Add(source);
            }
            job.Source = source;
        }
        else
        {
            job.Source = null;
        }

        if (!string.IsNullOrWhiteSpace(dto.Tags))
        {
            var names = dto.Tags.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var desired = new HashSet<string>(names, StringComparer.OrdinalIgnoreCase);

            if (job.JobTags.Count > 0)
            {
                _db.JobTags.RemoveRange(job.JobTags);
                job.JobTags.Clear();
            }

            foreach (var name in desired)
            {
                var tag = await _db.Tags.FirstOrDefaultAsync(t => t.Name == name);
                if (tag == null)
                {
                    tag = new Tag { Name = name };
                    _db.Tags.Add(tag);
                }
                job.JobTags.Add(new JobTag { Job = job, Tag = tag });
            }
        }
    }

    private static JobBranch? ParseBranch(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (value.Equals("Gigs", StringComparison.OrdinalIgnoreCase)) return JobBranch.Gigs;
        if (value.Equals("ItJobs", StringComparison.OrdinalIgnoreCase)) return JobBranch.ItJobs;
        if (value.Equals("IT", StringComparison.OrdinalIgnoreCase)) return JobBranch.ItJobs;
        return null;
    }

    private static bool TryParseEmploymentType(string? value, out EmploymentType type)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            type = default;
            return false;
        }

        return Enum.TryParse(value.Replace(" ", string.Empty), true, out type);
    }

    private static bool TryParseStatus(string? value, out JobStatus status)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            status = default;
            return false;
        }

        return Enum.TryParse(value.Replace(" ", string.Empty), true, out status);
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

    private static string? Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private class ImportJobDto
    {
        public string? Id { get; set; }
        public string? Branch { get; set; }
        public string? Title { get; set; }
        public string? CompanyOrPerson { get; set; }
        public string? Description { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? IsRemote { get; set; }
        public string? EmploymentType { get; set; }
        public string? DurationDays { get; set; }
        public string? PayMin { get; set; }
        public string? PayMax { get; set; }
        public string? Currency { get; set; }
        public string? PostedAt { get; set; }
        public string? ApplyUrl { get; set; }
        public string? Contact { get; set; }
        public string? Status { get; set; }
        public string? Source { get; set; }
        public string? Tags { get; set; }
    }
}
