using Microsoft.EntityFrameworkCore;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Repositories;

public class RefreshTokenRepository : Repository<RefreshToken>, IRefreshTokenRepository
{
    public RefreshTokenRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(t => t.TokenHash == tokenHash && t.RevokedAt == null, cancellationToken);

    public async Task<RefreshToken?> GetByTokenHashIncludingRevokedAsync(string tokenHash, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

    public async Task<RefreshToken?> GetByIdForUserAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, cancellationToken);

    public async Task<IReadOnlyList<RefreshToken>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Where(t => t.UserId == userId && t.RevokedAt == null && t.ExpiresAt > now)
            .OrderByDescending(t => t.LastActivityAt)
            .ToListAsync(cancellationToken);
    }

    public async Task RevokeAllForUserAsync(Guid userId, string? revokedByIp = null, CancellationToken cancellationToken = default)
    {
        var tokens = await DbSet.Where(t => t.UserId == userId && t.RevokedAt == null).ToListAsync(cancellationToken);
        var now = DateTime.UtcNow;
        foreach (var token in tokens)
        {
            token.RevokedAt = now;
            token.RevokedByIp = revokedByIp;
        }
    }
}
