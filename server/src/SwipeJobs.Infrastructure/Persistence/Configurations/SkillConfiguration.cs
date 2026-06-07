using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Configurations;

public class SkillConfiguration : IEntityTypeConfiguration<Skill>
{
    public void Configure(EntityTypeBuilder<Skill> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Level).HasMaxLength(50);

        builder.HasOne(s => s.UserProfile)
            .WithMany(u => u.Skills)
            .HasForeignKey(s => s.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
