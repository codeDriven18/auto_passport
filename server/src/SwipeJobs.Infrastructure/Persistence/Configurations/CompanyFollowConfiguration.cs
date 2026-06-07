using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Configurations;

public class CompanyFollowConfiguration : IEntityTypeConfiguration<CompanyFollow>
{
    public void Configure(EntityTypeBuilder<CompanyFollow> builder)
    {
        builder.HasKey(f => f.Id);

        builder.HasOne(f => f.UserProfile)
            .WithMany(u => u.CompanyFollows)
            .HasForeignKey(f => f.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(f => f.Company)
            .WithMany(c => c.Followers)
            .HasForeignKey(f => f.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(f => new { f.UserProfileId, f.CompanyId }).IsUnique();
    }
}
