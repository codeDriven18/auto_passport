using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Actor).IsRequired().HasMaxLength(320);
        builder.Property(l => l.Details).HasMaxLength(4000);
        builder.HasIndex(l => l.Timestamp);
        builder.HasIndex(l => l.Action);
        builder.HasIndex(l => l.EntityType);
        builder.HasIndex(l => l.ActorUserId);
    }
}
