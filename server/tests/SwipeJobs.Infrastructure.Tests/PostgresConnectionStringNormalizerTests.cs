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
        Assert.Contains("Trust Server Certificate=True", normalized, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Normalize_NpgsqlKeyValue_AddsSslForRenderHost()
    {
        var raw = $"Host={RenderHost};Port=5432;Database=swipejobsdb;Username=nico;Password=secret";

        var normalized = PostgresConnectionStringNormalizer.Normalize(raw);

        Assert.Contains("SSL Mode=Require", normalized, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("Trust Server Certificate=True", normalized, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void DescribeForLogs_DoesNotIncludePassword()
    {
        var raw = $"Host={RenderHost};Port=5432;Database=swipejobsdb;Username=nico;Password=secret";

        var description = PostgresConnectionStringNormalizer.DescribeForLogs(raw);

        Assert.Contains(RenderHost, description);
        Assert.DoesNotContain("secret", description);
        Assert.DoesNotContain("Password=", description);
    }
}
