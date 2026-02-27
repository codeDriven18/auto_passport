using JobAggregator.App.Data;
using JobAggregator.App.Models;
using Microsoft.EntityFrameworkCore;

namespace JobAggregator.App.Services;

public class StatsService
{
    private readonly AppDbContext _db;

    public StatsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SummaryResult> GetSummaryAsync()
    {
        var countsByBranch = await _db.Jobs
            .GroupBy(j => j.Branch)
            .Select(g => new StatsCount { Key = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        var countsByStatus = await _db.Jobs
            .GroupBy(j => j.Status)
            .Select(g => new StatsCount { Key = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        var topCities = await _db.Jobs
            .Where(j => j.City != null && j.City != "")
            .GroupBy(j => j.City!)
            .Select(g => new StatsCount { Key = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToListAsync();

        var topTags = await _db.JobTags
            .Include(jt => jt.Tag)
            .GroupBy(jt => jt.Tag.Name)
            .Select(g => new StatsCount { Key = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToListAsync();

        var topSources = await _db.Jobs
            .Where(j => j.Source != null)
            .GroupBy(j => j.Source!.Name)
            .Select(g => new StatsCount { Key = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToListAsync();

        var bookmarkedCount = await _db.UserPreferences.CountAsync(p => p.IsBookmarked);
        var appliedCount = await _db.UserPreferences.CountAsync(p => p.IsApplied);

        return new SummaryResult
        {
            CountsByBranch = countsByBranch,
            CountsByStatus = countsByStatus,
            TopCities = topCities,
            TopTags = topTags,
            TopSources = topSources,
            BookmarkedCount = bookmarkedCount,
            AppliedCount = appliedCount
        };
    }

    public async Task<TimeSeriesResult> GetTimeSeriesAsync(int days)
    {
        var span = days <= 0 ? 30 : Math.Min(days, 180);
        var since = DateTime.UtcNow.Date.AddDays(-span + 1);

        var rawPerDay = await _db.Jobs
            .Where(j => j.CreatedAt >= since)
            .GroupBy(j => j.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .OrderBy(x => x.Date)
            .ToListAsync();

        var lookup = rawPerDay.ToDictionary(x => x.Date, x => x.Count);
        var items = new List<StatsCount>();

        for (var i = 0; i < span; i++)
        {
            var date = since.AddDays(i);
            lookup.TryGetValue(date, out var count);
            items.Add(new StatsCount { Key = date.ToString("yyyy-MM-dd"), Count = count });
        }

        return new TimeSeriesResult
        {
            Days = span,
            JobsPerDay = items
        };
    }

    public class SummaryResult
    {
        public List<StatsCount> CountsByBranch { get; set; } = new();
        public List<StatsCount> CountsByStatus { get; set; } = new();
        public List<StatsCount> TopCities { get; set; } = new();
        public List<StatsCount> TopTags { get; set; } = new();
        public List<StatsCount> TopSources { get; set; } = new();
        public int BookmarkedCount { get; set; }
        public int AppliedCount { get; set; }
    }

    public class TimeSeriesResult
    {
        public int Days { get; set; }
        public List<StatsCount> JobsPerDay { get; set; } = new();
    }

    public class StatsCount
    {
        public string Key { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
