using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Infrastructure.Persistence.Configurations;

public class IngestionMessageConfiguration : IEntityTypeConfiguration<IngestionMessage>
{
    public void Configure(EntityTypeBuilder<IngestionMessage> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ExternalSourceKey).IsRequired().HasMaxLength(500);
        builder.Property(x => x.TelegramMessageId).HasMaxLength(100);
        builder.Property(x => x.TelegramMessageUrl).HasMaxLength(1000);
        builder.Property(x => x.ChannelName).HasMaxLength(200);
        builder.Property(x => x.ChannelUrl).HasMaxLength(1000);
        builder.Property(x => x.RawMessageText).IsRequired();
        builder.HasIndex(x => new { x.SourceId, x.ExternalSourceKey }).IsUnique();

        builder.HasOne(x => x.Source)
            .WithMany(s => s.IngestionMessages)
            .HasForeignKey(x => x.SourceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class JobCandidateConfiguration : IEntityTypeConfiguration<JobCandidate>
{
    public void Configure(EntityTypeBuilder<JobCandidate> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).HasMaxLength(300);
        builder.Property(x => x.CompanyName).HasMaxLength(200);
        builder.Property(x => x.Location).HasMaxLength(200);
        builder.Property(x => x.City).HasMaxLength(100);
        builder.Property(x => x.EmploymentType).HasMaxLength(50);
        builder.Property(x => x.ContentFingerprint).HasMaxLength(64);
        builder.Property(x => x.ApplyUrl).HasMaxLength(1000);
        builder.Property(x => x.ApplyEmail).HasMaxLength(200);
        builder.Property(x => x.ApplyTelegram).HasMaxLength(100);
        builder.Property(x => x.ApplyPhone).HasMaxLength(50);
        builder.Property(x => x.RejectedReason).HasMaxLength(500);
        builder.Property(x => x.SalaryMin).HasPrecision(18, 2);
        builder.Property(x => x.SalaryMax).HasPrecision(18, 2);
        builder.HasIndex(x => x.ContentFingerprint);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.DuplicateGroupId);

        builder.HasOne(x => x.Source)
            .WithMany(s => s.JobCandidates)
            .HasForeignKey(x => x.SourceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.PublishedJob)
            .WithMany()
            .HasForeignKey(x => x.PublishedJobId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class JobCandidateMessageConfiguration : IEntityTypeConfiguration<JobCandidateMessage>
{
    public void Configure(EntityTypeBuilder<JobCandidateMessage> builder)
    {
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => new { x.JobCandidateId, x.IngestionMessageId }).IsUnique();

        builder.HasOne(x => x.JobCandidate)
            .WithMany(c => c.MessageLinks)
            .HasForeignKey(x => x.JobCandidateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.IngestionMessage)
            .WithMany(m => m.CandidateLinks)
            .HasForeignKey(x => x.IngestionMessageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class JobReportConfiguration : IEntityTypeConfiguration<JobReport>
{
    public void Configure(EntityTypeBuilder<JobReport> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Details).HasMaxLength(1000);
        builder.HasIndex(x => x.Status);

        builder.HasOne(x => x.Job)
            .WithMany()
            .HasForeignKey(x => x.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class SourceIngestionLogConfiguration : IEntityTypeConfiguration<SourceIngestionLog>
{
    public void Configure(EntityTypeBuilder<SourceIngestionLog> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Stage).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Level).IsRequired().HasMaxLength(20);
        builder.Property(x => x.Message).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.Details).HasMaxLength(2000);
        builder.HasIndex(x => new { x.SourceId, x.CreatedAt });

        builder.HasOne(x => x.Source)
            .WithMany(s => s.IngestionLogs)
            .HasForeignKey(x => x.SourceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
