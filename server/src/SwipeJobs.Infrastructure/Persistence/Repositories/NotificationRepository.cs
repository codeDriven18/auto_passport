using Microsoft.EntityFrameworkCore;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Repositories;

public class NotificationRepository : Repository<Notification>, INotificationRepository
{
    public NotificationRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Notification>> GetByUserProfileIdAsync(
        Guid userProfileId, int limit, CancellationToken cancellationToken = default)
        => await DbSet.AsNoTracking()
            .Where(n => n.UserProfileId == userProfileId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

    public async Task<int> GetUnreadCountAsync(Guid userProfileId, CancellationToken cancellationToken = default)
        => await DbSet.CountAsync(n => n.UserProfileId == userProfileId && !n.IsRead, cancellationToken);

    public async Task MarkAllReadAsync(Guid userProfileId, CancellationToken cancellationToken = default)
    {
        var unread = await DbSet
            .Where(n => n.UserProfileId == userProfileId && !n.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var n in unread)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
        }
    }

    public Task DeleteAllForUserAsync(Guid userProfileId, CancellationToken cancellationToken = default)
        => DbSet.Where(n => n.UserProfileId == userProfileId).ExecuteDeleteAsync(cancellationToken);

    public async Task<bool> ExistsAsync(
        Guid userProfileId, string title, Guid? relatedJobId, CancellationToken cancellationToken = default)
        => await DbSet.AnyAsync(
            n => n.UserProfileId == userProfileId
                && n.Title == title
                && n.RelatedJobId == relatedJobId,
            cancellationToken);

    public async Task<IReadOnlyList<Notification>> GetRecentAsync(int limit, CancellationToken cancellationToken = default)
        => await DbSet.AsNoTracking()
            .Include(n => n.UserProfile)
                .ThenInclude(p => p.User)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);
}
