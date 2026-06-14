using SwipeJobs.Infrastructure.Persistence;
using Xunit;

namespace SwipeJobs.Infrastructure.Tests;

public class PostgresConnectionStringNormalizerTests
{
    private const string RenderHost = "dpg-example.oregon-postgres.render.com";

    [Fact]
    public void Normalize_PostgresUri_AddsSslForRenderHost()
    {
        var uri = $"postgresql://user:pass@{RenderHost}/swipejobsdb";

        var normalized = PostgresConnectionStringNormalizer.Normalize(uri);

        Assert.Contains($"Host={RenderHost}", normalized);
        Assert.Contains("SSL Mode=Require", normalized, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Normalize_NpgsqlKeyValue_AddsSslForRenderHost()
    {
        var raw = $"Host={RenderHost};Port=5432;Database=swipejobsdb;Username=nico;Password=secret";

        var normalized = PostgresConnectionStringNormalizer.Normalize(raw);

        Assert.Contains("SSL Mode=Require", normalized, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Normalize_InternalRenderHost_UsesExternalHostname()
    {
        var raw = "postgresql://user:pass@dpg-example-a/swipejobsdb";

        var normalized = PostgresConnectionStringNormalizer.Normalize(raw);

        Assert.Contains("Host=dpg-example-a.oregon-postgres.render.com", normalized);
    }

    [Fact]
    public void DescribeRuntime_DoesNotIncludePassword()
    {
        var raw = $"Host={RenderHost};Port=5432;Database=swipejobsdb;Username=nico;Password=secret";

        var description = PostgresConnectionStringNormalizer.DescribeForLogs(raw);

        Assert.Contains(RenderHost, description);
        Assert.DoesNotContain("secret", description);
        Assert.DoesNotContain("Password=", description);
    }

    [Fact]
    public void DescribeRuntime_ReportsSafeFields()
    {
        var raw = $"Host={RenderHost};Port=5432;Database=swipejobsdb;Username=nico;Password=secret";

        var runtime = PostgresConnectionStringNormalizer.DescribeRuntime(raw, "test");

        Assert.Equal(RenderHost, runtime.Host);
        Assert.Equal("swipejobsdb", runtime.Database);
        Assert.Equal("nico", runtime.Username);
        Assert.Equal(6, runtime.PasswordLength);
        Assert.Equal("test", runtime.Source);
    }
}
