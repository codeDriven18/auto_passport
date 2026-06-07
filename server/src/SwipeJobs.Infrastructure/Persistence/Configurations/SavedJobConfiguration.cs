using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Configurations;

public class SavedJobConfiguration : IEntityTypeConfiguration<SavedJob>
{
    public void Configure(EntityTypeBuilder<SavedJob> builder)
    {
        builder.HasKey(s => s.Id);

        builder.HasOne(s => s.UserProfile)
            .WithMany(u => u.SavedJobs)
            .HasForeignKey(s => s.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Job)
            .WithMany(j => j.SavedByUsers)
            .HasForeignKey(s => s.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => new { s.UserProfileId, s.JobId }).IsUnique();
    }
}
