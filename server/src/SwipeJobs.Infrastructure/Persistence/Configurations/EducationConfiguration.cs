using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Configurations;

public class EducationConfiguration : IEntityTypeConfiguration<Education>
{
    public void Configure(EntityTypeBuilder<Education> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Institution).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Degree).IsRequired().HasMaxLength(200);
        builder.Property(e => e.FieldOfStudy).HasMaxLength(200);

        builder.HasOne(e => e.UserProfile)
            .WithMany(u => u.Educations)
            .HasForeignKey(e => e.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
