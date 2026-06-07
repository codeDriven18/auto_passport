using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.HasKey(n => n.Id);
        builder.Property(n => n.Title).IsRequired().HasMaxLength(200);
        builder.Property(n => n.Message).HasMaxLength(1000);

        builder.HasOne(n => n.UserProfile)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(n => new { n.UserProfileId, n.IsRead, n.CreatedAt });
    }
}
