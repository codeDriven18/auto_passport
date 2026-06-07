using Microsoft.EntityFrameworkCore;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Repositories;

public class JobRepository : Repository<Job>, IJobRepository
{
    public JobRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Job>> GetActiveJobsAsync(CancellationToken cancellationToken = default)
        => await BuildQuery()
            .Where(j => j.IsActive)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<(IReadOnlyList<Job> Items, int TotalCount)> SearchAsync(
        JobQueryDto query,
        CancellationToken cancellationToken = default)
    {
        var q = BuildQuery().Where(j => j.IsActive && !j.IsArchived);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(j =>
                j.Title.ToLower().Contains(term) ||
                j.Company.Name.ToLower().Contains(term) ||
                j.Description.ToLower().Contains(term));
        }

        if (query.CompanyId.HasValue)
            q = q.Where(j => j.CompanyId == query.CompanyId.Value);

        if (!string.IsNullOrWhiteSpace(query.CompanySlug))
        {
            var slug = query.CompanySlug.Trim().ToLower();
            q = q.Where(j => j.Company.Slug.ToLower() == slug);
        }

        if (query.Category.HasValue)
            q = q.Where(j => j.Category == query.Category.Value);

        if (!string.IsNullOrWhiteSpace(query.City))
        {
            var city = query.City.Trim().ToLower();
            q = q.Where(j => j.City != null && j.City.ToLower().Contains(city));
        }

        if (query.IsRemote.HasValue)
            q = q.Where(j => j.IsRemote == query.IsRemote.Value);

        if (query.SalaryMin.HasValue)
            q = q.Where(j => j.SalaryMax == null || j.SalaryMax >= query.SalaryMin.Value);

        if (!string.IsNullOrWhiteSpace(query.Tags))
        {
            var slugs = query.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(s => s.ToLower()).ToList();
            if (slugs.Count > 0)
            {
                q = q.Where(j => j.JobTags.Any(jt =>
                    jt.Tag.Slug != null && slugs.Contains(jt.Tag.Slug.ToLower())));
            }
        }

        var totalCount = await q.CountAsync(cancellationToken);

        q = ApplySorting(q, query.SortBy, query.SortOrder);

        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 50);

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Job?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
        => await BuildQuery()
            .FirstOrDefaultAsync(j => j.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Job>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default)
        => await BuildQuery()
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Job>> GetByCompanyIdAsync(Guid companyId, CancellationToken cancellationToken = default)
        => await BuildQuery()
            .Where(j => j.CompanyId == companyId)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task SetTagsAsync(Guid jobId, IReadOnlyList<Guid> tagIds, CancellationToken cancellationToken = default)
    {
        var existing = await Context.JobTags.Where(jt => jt.JobId == jobId).ToListAsync(cancellationToken);
        Context.JobTags.RemoveRange(existing);

        foreach (var tagId in tagIds.Distinct())
        {
            Context.JobTags.Add(new JobTag { JobId = jobId, TagId = tagId });
        }
    }

    private IQueryable<Job> BuildQuery() =>
        DbSet
            .AsNoTracking()
            .Include(j => j.Company)
            .Include(j => j.Source)
            .Include(j => j.JobTags)
                .ThenInclude(jt => jt.Tag);

    private static IQueryable<Job> ApplySorting(IQueryable<Job> q, string sortBy, string sortOrder)
    {
        var desc = sortOrder.Equals("desc", StringComparison.OrdinalIgnoreCase);

        return sortBy.ToLower() switch
        {
            "title" => desc ? q.OrderByDescending(j => j.Title) : q.OrderBy(j => j.Title),
            "salary" => desc
                ? q.OrderByDescending(j => j.SalaryMax ?? j.SalaryMin ?? 0)
                : q.OrderBy(j => j.SalaryMin ?? j.SalaryMax ?? 0),
            "company" => desc ? q.OrderByDescending(j => j.Company.Name) : q.OrderBy(j => j.Company.Name),
            _ => desc ? q.OrderByDescending(j => j.CreatedAt) : q.OrderBy(j => j.CreatedAt),
        };
    }
}
