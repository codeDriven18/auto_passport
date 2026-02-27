using System.Globalization;
using JobAggregator.App.Data;
using JobAggregator.App.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobAggregator.App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly AppDbContext _db;

    public JobsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
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
        [FromQuery] string? status,
        [FromQuery] string? sort = "newest",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
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

        query = sort switch
        {
            "oldest" => query.OrderBy(j => j.PostedAt).ThenBy(j => j.CreatedAt),
            "pay_high" => query.OrderByDescending(j => j.PayMax ?? j.PayMin),
            "pay_low" => query.OrderBy(j => j.PayMin ?? j.PayMax),
            _ => query.OrderByDescending(j => j.PostedAt).ThenByDescending(j => j.CreatedAt)
        };

        page = Math.Max(page, 1);
        pageSize = pageSize <= 0 ? 20 : Math.Min(pageSize, 100);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(j => new JobListItemDto
            {
                Id = j.Id,
                Branch = j.Branch,
                Title = j.Title,
                CompanyOrPerson = j.CompanyOrPerson,
                City = j.City,
                Country = j.Country,
                IsRemote = j.IsRemote,
                PayMin = j.PayMin,
                PayMax = j.PayMax,
                Currency = j.Currency,
                PostedAt = j.PostedAt,
                Status = j.Status,
                Source = j.Source == null ? null : new SourceDto { Id = j.Source.Id, Name = j.Source.Name },
                Tags = j.JobTags.Select(jt => new TagDto { Id = jt.Tag.Id, Name = jt.Tag.Name }).ToList(),
                Preference = j.UserPreference == null
                    ? new PreferenceDto()
                    : new PreferenceDto
                    {
                        IsBookmarked = j.UserPreference.IsBookmarked,
                        IsApplied = j.UserPreference.IsApplied,
                        Notes = j.UserPreference.Notes
                    }
            })
            .ToListAsync();

        return Ok(new { totalCount, totalPages, page, pageSize, items });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var job = await _db.Jobs
            .Include(j => j.Source)
            .Include(j => j.JobTags).ThenInclude(jt => jt.Tag)
            .Include(j => j.UserPreference)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (job == null) return NotFound();

        return Ok(new JobDetailDto
        {
            Id = job.Id,
            Branch = job.Branch,
            Title = job.Title,
            CompanyOrPerson = job.CompanyOrPerson,
            Description = job.Description,
            City = job.City,
            Country = job.Country,
            IsRemote = job.IsRemote,
            EmploymentType = job.EmploymentType,
            DurationDays = job.DurationDays,
            PayMin = job.PayMin,
            PayMax = job.PayMax,
            Currency = job.Currency,
            PostedAt = job.PostedAt,
            ApplyUrl = job.ApplyUrl,
            Contact = job.Contact,
            Status = job.Status,
            Source = job.Source == null ? null : new SourceDto { Id = job.Source.Id, Name = job.Source.Name, Url = job.Source.Url },
            Tags = job.JobTags.Select(jt => new TagDto { Id = jt.Tag.Id, Name = jt.Tag.Name }).ToList(),
            Preference = job.UserPreference == null
                ? new PreferenceDto()
                : new PreferenceDto
                {
                    IsBookmarked = job.UserPreference.IsBookmarked,
                    IsApplied = job.UserPreference.IsApplied,
                    Notes = job.UserPreference.Notes
                }
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JobUpsertDto body)
    {
        var validation = await ValidateUpsertAsync(body);
        if (validation != null) return validation;

        var now = DateTime.UtcNow;
        var job = new Job
        {
            Id = Guid.NewGuid(),
            Branch = body.Branch,
            Title = body.Title.Trim(),
            CompanyOrPerson = body.CompanyOrPerson.Trim(),
            Description = body.Description.Trim(),
            City = Normalize(body.City),
            Country = Normalize(body.Country),
            IsRemote = body.IsRemote,
            EmploymentType = body.EmploymentType,
            DurationDays = body.DurationDays,
            PayMin = body.PayMin,
            PayMax = body.PayMax,
            Currency = Normalize(body.Currency),
            ApplyUrl = Normalize(body.ApplyUrl),
            Contact = Normalize(body.Contact),
            PostedAt = body.PostedAt == default ? DateTime.UtcNow.Date : body.PostedAt.Date,
            Status = body.Status ?? JobStatus.Active,
            CreatedAt = now,
            UpdatedAt = now
        };

        job.Source = await ResolveSourceAsync(body.SourceId, body.SourceName);
        await SyncTagsAsync(job, body.TagIds, body.TagNames);

        _db.Jobs.Add(job);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = job.Id }, new { job.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] JobUpsertDto body)
    {
        var validation = await ValidateUpsertAsync(body);
        if (validation != null) return validation;

        var job = await _db.Jobs
            .Include(j => j.JobTags)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (job == null) return NotFound();

        job.Branch = body.Branch;
        job.Title = body.Title.Trim();
        job.CompanyOrPerson = body.CompanyOrPerson.Trim();
        job.Description = body.Description.Trim();
        job.City = Normalize(body.City);
        job.Country = Normalize(body.Country);
        job.IsRemote = body.IsRemote;
        job.EmploymentType = body.EmploymentType;
        job.DurationDays = body.DurationDays;
        job.PayMin = body.PayMin;
        job.PayMax = body.PayMax;
        job.Currency = Normalize(body.Currency);
        job.ApplyUrl = Normalize(body.ApplyUrl);
        job.Contact = Normalize(body.Contact);
        job.PostedAt = body.PostedAt == default ? job.PostedAt : body.PostedAt.Date;
        job.Status = body.Status ?? job.Status;
        job.Source = await ResolveSourceAsync(body.SourceId, body.SourceName);
        job.UpdatedAt = DateTime.UtcNow;

        await SyncTagsAsync(job, body.TagIds, body.TagNames);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] StatusDto body)
    {
        var job = await _db.Jobs.FindAsync(id);
        if (job == null) return NotFound();

        job.Status = body.Status;
        job.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { job.Id, job.Status });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var job = await _db.Jobs.FindAsync(id);
        if (job == null) return NotFound();

        _db.Jobs.Remove(job);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:guid}/bookmark")]
    public async Task<IActionResult> ToggleBookmark(Guid id, [FromBody] ToggleDto? body)
    {
        var pref = await GetOrCreatePreferenceAsync(id);
        if (pref == null) return NotFound();

        pref.IsBookmarked = body?.Value ?? !pref.IsBookmarked;
        pref.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { pref.JobId, pref.IsBookmarked });
    }

    [HttpPost("{id:guid}/applied")]
    public async Task<IActionResult> ToggleApplied(Guid id, [FromBody] ToggleDto? body)
    {
        var pref = await GetOrCreatePreferenceAsync(id);
        if (pref == null) return NotFound();

        pref.IsApplied = body?.Value ?? !pref.IsApplied;
        pref.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { pref.JobId, pref.IsApplied });
    }

    [HttpPut("{id:guid}/note")]
    public async Task<IActionResult> UpdateNote(Guid id, [FromBody] NoteDto body)
    {
        var pref = await GetOrCreatePreferenceAsync(id);
        if (pref == null) return NotFound();

        pref.Notes = string.IsNullOrWhiteSpace(body.Notes) ? null : body.Notes.Trim();
        pref.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { pref.JobId, pref.Notes });
    }

    private async Task<UserPreference?> GetOrCreatePreferenceAsync(Guid jobId)
    {
        var jobExists = await _db.Jobs.AnyAsync(j => j.Id == jobId);
        if (!jobExists) return null;

        var pref = await _db.UserPreferences.FirstOrDefaultAsync(p => p.JobId == jobId);
        if (pref != null) return pref;

        pref = new UserPreference
        {
            JobId = jobId,
            UpdatedAt = DateTime.UtcNow
        };
        _db.UserPreferences.Add(pref);
        return pref;
    }

    private async Task<IActionResult?> ValidateUpsertAsync(JobUpsertDto body)
    {
        if (string.IsNullOrWhiteSpace(body.Title))
        {
            return BadRequest("Title is required.");
        }

        if (string.IsNullOrWhiteSpace(body.CompanyOrPerson))
        {
            return BadRequest("CompanyOrPerson is required.");
        }

        if (string.IsNullOrWhiteSpace(body.Description))
        {
            return BadRequest("Description is required.");
        }

        if (body.Branch == JobBranch.Gigs && (!body.DurationDays.HasValue || body.DurationDays <= 0))
        {
            return BadRequest("DurationDays is required for gigs.");
        }

        if (body.Branch == JobBranch.ItJobs && body.EmploymentType == null)
        {
            return BadRequest("EmploymentType is required for IT jobs.");
        }

        if (body.SourceId.HasValue && !await _db.Sources.AnyAsync(s => s.Id == body.SourceId.Value))
        {
            return BadRequest("SourceId not found.");
        }

        return null;
    }

    private async Task<Source?> ResolveSourceAsync(int? sourceId, string? sourceName)
    {
        if (sourceId.HasValue)
        {
            return await _db.Sources.FindAsync(sourceId.Value);
        }

        if (!string.IsNullOrWhiteSpace(sourceName))
        {
            var name = sourceName.Trim();
            var existing = await _db.Sources.FirstOrDefaultAsync(s => s.Name == name);
            if (existing != null) return existing;

            var source = new Source { Name = name };
            _db.Sources.Add(source);
            return source;
        }

        return null;
    }

    private async Task SyncTagsAsync(Job job, List<int>? tagIds, List<string>? tagNames)
    {
        var desired = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        if (tagIds != null && tagIds.Count > 0)
        {
            var names = await _db.Tags.Where(t => tagIds.Contains(t.Id)).Select(t => t.Name).ToListAsync();
            foreach (var name in names)
            {
                desired.Add(name);
            }
        }

        if (tagNames != null)
        {
            foreach (var name in tagNames.Where(n => !string.IsNullOrWhiteSpace(n)))
            {
                desired.Add(name.Trim());
            }
        }

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

    public class JobListItemDto
    {
        public Guid Id { get; set; }
        public JobBranch Branch { get; set; }
        public string Title { get; set; } = string.Empty;
        public string CompanyOrPerson { get; set; } = string.Empty;
        public string? City { get; set; }
        public string? Country { get; set; }
        public bool IsRemote { get; set; }
        public decimal? PayMin { get; set; }
        public decimal? PayMax { get; set; }
        public string? Currency { get; set; }
        public DateTime PostedAt { get; set; }
        public JobStatus Status { get; set; }
        public List<TagDto> Tags { get; set; } = new();
        public SourceDto? Source { get; set; }
        public PreferenceDto Preference { get; set; } = new();
    }

    public class JobDetailDto
    {
        public Guid Id { get; set; }
        public JobBranch Branch { get; set; }
        public string Title { get; set; } = string.Empty;
        public string CompanyOrPerson { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? City { get; set; }
        public string? Country { get; set; }
        public bool IsRemote { get; set; }
        public EmploymentType? EmploymentType { get; set; }
        public int? DurationDays { get; set; }
        public decimal? PayMin { get; set; }
        public decimal? PayMax { get; set; }
        public string? Currency { get; set; }
        public DateTime PostedAt { get; set; }
        public string? ApplyUrl { get; set; }
        public string? Contact { get; set; }
        public JobStatus Status { get; set; }
        public SourceDto? Source { get; set; }
        public List<TagDto> Tags { get; set; } = new();
        public PreferenceDto Preference { get; set; } = new();
    }

    public class JobUpsertDto
    {
        public JobBranch Branch { get; set; }
        public string Title { get; set; } = string.Empty;
        public string CompanyOrPerson { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? City { get; set; }
        public string? Country { get; set; }
        public bool IsRemote { get; set; }
        public EmploymentType? EmploymentType { get; set; }
        public int? DurationDays { get; set; }
        public decimal? PayMin { get; set; }
        public decimal? PayMax { get; set; }
        public string? Currency { get; set; }
        public DateTime PostedAt { get; set; }
        public string? ApplyUrl { get; set; }
        public string? Contact { get; set; }
        public int? SourceId { get; set; }
        public string? SourceName { get; set; }
        public JobStatus? Status { get; set; }
        public List<int>? TagIds { get; set; }
        public List<string>? TagNames { get; set; }
    }

    public class StatusDto
    {
        public JobStatus Status { get; set; }
    }

    public class ToggleDto
    {
        public bool Value { get; set; }
    }

    public class NoteDto
    {
        public string? Notes { get; set; }
    }

    public class TagDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class SourceDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Url { get; set; }
    }

    public class PreferenceDto
    {
        public bool IsBookmarked { get; set; }
        public bool IsApplied { get; set; }
        public string? Notes { get; set; }
    }
}
