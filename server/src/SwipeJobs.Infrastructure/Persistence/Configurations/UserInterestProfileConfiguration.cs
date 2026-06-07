using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Configurations;

public class UserInterestProfileConfiguration : IEntityTypeConfiguration<UserInterestProfile>
{
    public void Configure(EntityTypeBuilder<UserInterestProfile> builder)
    {
        builder.HasKey(p => p.Id);

        builder.HasOne(p => p.UserProfile)
            .WithOne(u => u.InterestProfile)
            .HasForeignKey<UserInterestProfile>(p => p.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.UserProfileId).IsUnique();
    }
}
