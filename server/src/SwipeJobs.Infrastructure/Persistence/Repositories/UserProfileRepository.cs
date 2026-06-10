using Microsoft.EntityFrameworkCore;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Repositories;

public class UserProfileRepository : Repository<UserProfile>, IUserProfileRepository
{
    public UserProfileRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<UserProfile?> GetByExternalUserIdAsync(string externalUserId, CancellationToken cancellationToken = default)
        => await DbSet
            .Include(u => u.Educations)
            .Include(u => u.Skills)
            .Include(u => u.Experiences)
            .FirstOrDefaultAsync(u => u.ExternalUserId == externalUserId, cancellationToken);

    public async Task<UserProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        => await DbSet
            .Include(u => u.Educations)
            .Include(u => u.Skills)
            .Include(u => u.Experiences)
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);

    public Task<UserProfile?> GetByUserIdForUpdateAsync(Guid userId, CancellationToken cancellationToken = default)
        => DbSet.FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);

    public async Task<UserProfile?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
        => await DbSet
            .Include(u => u.Educations)
            .Include(u => u.Skills)
            .Include(u => u.Experiences)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public Task<UserProfile?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken = default)
        => DbSet.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public async Task ReplaceEducationsAsync(
        Guid profileId,
        IReadOnlyList<Education> educations,
        CancellationToken cancellationToken = default)
    {
        var existing = await Context.Set<Education>()
            .Where(e => e.UserProfileId == profileId)
            .ToListAsync(cancellationToken);

        if (existing.Count > 0)
            Context.Set<Education>().RemoveRange(existing);

        foreach (var education in educations)
        {
            education.UserProfileId = profileId;
            await Context.Set<Education>().AddAsync(education, cancellationToken);
        }
    }

    public async Task ReplaceSkillsAsync(
        Guid profileId,
        IReadOnlyList<Skill> skills,
        CancellationToken cancellationToken = default)
    {
        var existing = await Context.Set<Skill>()
            .Where(s => s.UserProfileId == profileId)
            .ToListAsync(cancellationToken);

        if (existing.Count > 0)
            Context.Set<Skill>().RemoveRange(existing);

        foreach (var skill in skills)
        {
            skill.UserProfileId = profileId;
            await Context.Set<Skill>().AddAsync(skill, cancellationToken);
        }
    }

    public async Task ReplaceExperiencesAsync(
        Guid profileId,
        IReadOnlyList<Experience> experiences,
        CancellationToken cancellationToken = default)
    {
        var existing = await Context.Set<Experience>()
            .Where(e => e.UserProfileId == profileId)
            .ToListAsync(cancellationToken);

        if (existing.Count > 0)
            Context.Set<Experience>().RemoveRange(existing);

        foreach (var experience in experiences)
        {
            experience.UserProfileId = profileId;
            await Context.Set<Experience>().AddAsync(experience, cancellationToken);
        }
    }
}
