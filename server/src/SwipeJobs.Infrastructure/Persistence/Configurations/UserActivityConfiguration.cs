using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Configurations;

public class UserActivityConfiguration : IEntityTypeConfiguration<UserActivity>
{
    public void Configure(EntityTypeBuilder<UserActivity> builder)
    {
        builder.HasKey(a => a.Id);

        builder.HasOne(a => a.UserProfile)
            .WithMany(u => u.Activities)
            .HasForeignKey(a => a.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Job)
            .WithMany()
            .HasForeignKey(a => a.JobId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(a => a.Company)
            .WithMany()
            .HasForeignKey(a => a.CompanyId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(a => new { a.UserProfileId, a.OccurredAt });
        builder.HasIndex(a => new { a.ActivityType, a.JobId });
        builder.HasIndex(a => new { a.ActivityType, a.CompanyId });
    }
}
