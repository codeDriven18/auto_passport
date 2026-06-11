using Microsoft.EntityFrameworkCore;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Infrastructure.Persistence.Repositories;

public class UserActivityRepository : Repository<UserActivity>, IUserActivityRepository
{
    public UserActivityRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<UserActivity>> GetByUserProfileIdAsync(
        Guid userProfileId, CancellationToken cancellationToken = default)
        => await DbSet.AsNoTracking()
            .Where(a => a.UserProfileId == userProfileId)
            .OrderByDescending(a => a.OccurredAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<UserActivity>> GetRecentByUserAndTypeAsync(
        Guid userProfileId, ActivityType activityType, int limit, CancellationToken cancellationToken = default)
        => await DbSet.AsNoTracking()
            .Where(a => a.UserProfileId == userProfileId && a.ActivityType == activityType)
            .OrderByDescending(a => a.OccurredAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

    public Task<int> CountByUserAndTypeAsync(
        Guid userProfileId, ActivityType activityType, CancellationToken cancellationToken = default)
        => DbSet.AsNoTracking()
            .CountAsync(a => a.UserProfileId == userProfileId && a.ActivityType == activityType, cancellationToken);

    public async Task<IReadOnlyList<Guid>> GetRecentViewedJobIdsAsync(
        Guid userProfileId, int limit, CancellationToken cancellationToken = default)
        => await DbSet.AsNoTracking()
            .Where(a => a.UserProfileId == userProfileId
                && a.ActivityType == ActivityType.JobViewed
                && a.JobId != null)
            .OrderByDescending(a => a.OccurredAt)
            .Select(a => a.JobId!.Value)
            .Distinct()
            .Take(limit)
            .ToListAsync(cancellationToken);

    public async Task<Dictionary<Guid, int>> GetJobActivityCountsAsync(
        ActivityType activityType, CancellationToken cancellationToken = default)
        => await DbSet.AsNoTracking()
            .Where(a => a.ActivityType == activityType && a.JobId != null)
            .GroupBy(a => a.JobId!.Value)
            .Select(g => new { JobId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.JobId, x => x.Count, cancellationToken);

    public async Task<DateTime?> GetLastActivityAtAsync(
        Guid userProfileId, ActivityType activityType, CancellationToken cancellationToken = default)
    {
        var last = await DbSet.AsNoTracking()
            .Where(a => a.UserProfileId == userProfileId && a.ActivityType == activityType)
            .OrderByDescending(a => a.OccurredAt)
            .Select(a => (DateTime?)a.OccurredAt)
            .FirstOrDefaultAsync(cancellationToken);
        return last;
    }
}
