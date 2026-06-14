using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Configurations;

public class SourceConfiguration : IEntityTypeConfiguration<Source>
{
    public void Configure(EntityTypeBuilder<Source> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(200);
        builder.Property(s => s.ExternalIdentifier).HasMaxLength(500);
        builder.Property(s => s.ChannelName).HasMaxLength(200);
        builder.Property(s => s.ChannelUrl).HasMaxLength(1000);
        builder.Property(s => s.LastSyncStatus).HasMaxLength(100);
        builder.Property(s => s.LastIngestionError).HasMaxLength(1000);
        builder.Property(s => s.LastScannedTelegramMessageId).HasMaxLength(100);
        builder.Property(s => s.LogoUrl).HasMaxLength(1000);
        builder.Property(s => s.TrustScore).HasDefaultValue(50);
        builder.Property(s => s.DefaultExpirationDays).HasDefaultValue(30);
        builder.HasIndex(s => s.Type);
        builder.HasIndex(s => s.ExternalIdentifier);
        builder.HasIndex(s => s.ChannelUrl);
    }
}
