using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Configurations;

public class JobTagConfiguration : IEntityTypeConfiguration<JobTag>
{
    public void Configure(EntityTypeBuilder<JobTag> builder)
    {
        builder.HasKey(jt => new { jt.JobId, jt.TagId });

        builder.HasOne(jt => jt.Job)
            .WithMany(j => j.JobTags)
            .HasForeignKey(jt => jt.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(jt => jt.Tag)
            .WithMany(t => t.JobTags)
            .HasForeignKey(jt => jt.TagId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
