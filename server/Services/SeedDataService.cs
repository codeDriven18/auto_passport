using JobAggregator.App.Data;
using JobAggregator.App.Models;
using Microsoft.EntityFrameworkCore;

namespace JobAggregator.App.Services;

public class SeedDataService
{
    private readonly AppDbContext _db;

    public SeedDataService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<bool> SeedDemoDataAsync()
    {
        var source = await _db.Sources.FirstOrDefaultAsync(s => s.Name == "Seed Demo");
        if (source != null)
        {
            var existing = await _db.Jobs.AnyAsync(j => j.SourceId == source.Id);
            if (existing) return false;
        }

        source ??= new Source { Name = "Seed Demo", Url = "https://example.com" };
        _db.Sources.Add(source);

        var tags = new[]
        {
            new Tag { Name = "Cleaning" },
            new Tag { Name = "Delivery" },
            new Tag { Name = "Warehouse" },
            new Tag { Name = "C#" },
            new Tag { Name = "ASP.NET Core" },
            new Tag { Name = "React" },
            new Tag { Name = "SQL" },
            new Tag { Name = "Remote" }
        };

        foreach (var tag in tags)
        {
            if (!await _db.Tags.AnyAsync(t => t.Name == tag.Name))
            {
                _db.Tags.Add(tag);
            }
        }

        var now = DateTime.UtcNow;
        var jobs = new List<Job>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Branch = JobBranch.Gigs,
                Title = "Event setup helper (2 days)",
                CompanyOrPerson = "City Events",
                Description = "Help set up booths, tables, and banners over two days.",
                City = "Berlin",
                Country = "Germany",
                IsRemote = false,
                EmploymentType = EmploymentType.Gig,
                DurationDays = 2,
                PayMin = 90,
                PayMax = 120,
                Currency = "EUR",
                ApplyUrl = "mailto:gigs@cityevents.com",
                Contact = "@cityevents",
                PostedAt = now.AddDays(-2),
                CreatedAt = now.AddDays(-2),
                UpdatedAt = now.AddDays(-2),
                Status = JobStatus.Active,
                Source = source
            },
            new()
            {
                Id = Guid.NewGuid(),
                Branch = JobBranch.Gigs,
                Title = "Warehouse picker (1 day)",
                CompanyOrPerson = "LogiHub",
                Description = "Short-term help with packing and labeling orders.",
                City = "Tashkent",
                Country = "Uzbekistan",
                IsRemote = false,
                EmploymentType = EmploymentType.Gig,
                DurationDays = 1,
                PayMin = 350000,
                PayMax = 420000,
                Currency = "UZS",
                PostedAt = now.AddDays(-1),
                CreatedAt = now.AddDays(-1),
                UpdatedAt = now.AddDays(-1),
                Status = JobStatus.Active,
                Source = source
            },
            new()
            {
                Id = Guid.NewGuid(),
                Branch = JobBranch.ItJobs,
                Title = "Junior .NET Developer",
                CompanyOrPerson = "TechWorks",
                Description = "Build REST APIs and maintain EF Core models.",
                City = "Remote",
                Country = null,
                IsRemote = true,
                EmploymentType = EmploymentType.FullTime,
                PayMin = 1800,
                PayMax = 2400,
                Currency = "EUR",
                ApplyUrl = "https://example.com/apply",
                Contact = "jobs@techworks.com",
                PostedAt = now.AddDays(-8),
                CreatedAt = now.AddDays(-8),
                UpdatedAt = now.AddDays(-6),
                Status = JobStatus.Active,
                Source = source
            },
            new()
            {
                Id = Guid.NewGuid(),
                Branch = JobBranch.ItJobs,
                Title = "React Frontend Intern",
                CompanyOrPerson = "BrightApps",
                Description = "Assist with building component library and UI screens.",
                City = "Warsaw",
                Country = "Poland",
                IsRemote = false,
                EmploymentType = EmploymentType.Internship,
                PayMin = 900,
                PayMax = 1200,
                Currency = "EUR",
                ApplyUrl = "https://example.com/intern",
                Contact = "@brightapps",
                PostedAt = now.AddDays(-4),
                CreatedAt = now.AddDays(-4),
                UpdatedAt = now.AddDays(-3),
                Status = JobStatus.Active,
                Source = source
            }
        };

        _db.Jobs.AddRange(jobs);
        await _db.SaveChangesAsync();

        await AddTagLinksAsync(jobs[0], new[] { "Cleaning", "Delivery" });
        await AddTagLinksAsync(jobs[1], new[] { "Warehouse" });
        await AddTagLinksAsync(jobs[2], new[] { "C#", "ASP.NET Core", "SQL", "Remote" });
        await AddTagLinksAsync(jobs[3], new[] { "React" });

        await _db.SaveChangesAsync();
        return true;
    }

    private async Task AddTagLinksAsync(Job job, IEnumerable<string> names)
    {
        foreach (var name in names)
        {
            var tag = await _db.Tags.FirstAsync(t => t.Name == name);
            _db.JobTags.Add(new JobTag { JobId = job.Id, TagId = tag.Id });
        }
    }
}
