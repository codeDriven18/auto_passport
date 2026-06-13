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
        builder.Property(s => s.LogoUrl).HasMaxLength(1000);
        builder.Property(s => s.TrustScore).HasDefaultValue(50);
        builder.HasIndex(s => s.Type);
    }
}
