using JobAggregator.App.Models;
using Microsoft.EntityFrameworkCore;

namespace JobAggregator.App.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<JobTag> JobTags => Set<JobTag>();
    public DbSet<Source> Sources => Set<Source>();
    public DbSet<UserPreference> UserPreferences => Set<UserPreference>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<JobTag>()
            .HasKey(jt => new { jt.JobId, jt.TagId });

        modelBuilder.Entity<JobTag>()
            .HasOne(jt => jt.Job)
            .WithMany(j => j.JobTags)
            .HasForeignKey(jt => jt.JobId);

        modelBuilder.Entity<JobTag>()
            .HasOne(jt => jt.Tag)
            .WithMany(t => t.JobTags)
            .HasForeignKey(jt => jt.TagId);

        modelBuilder.Entity<UserPreference>()
            .HasOne(up => up.Job)
            .WithOne(j => j.UserPreference)
            .HasForeignKey<UserPreference>(up => up.JobId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}


