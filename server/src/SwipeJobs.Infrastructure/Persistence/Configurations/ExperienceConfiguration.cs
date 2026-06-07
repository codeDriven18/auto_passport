using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Configurations;

public class ExperienceConfiguration : IEntityTypeConfiguration<Experience>
{
    public void Configure(EntityTypeBuilder<Experience> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Company).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);

        builder.HasOne(e => e.UserProfile)
            .WithMany(u => u.Experiences)
            .HasForeignKey(e => e.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
