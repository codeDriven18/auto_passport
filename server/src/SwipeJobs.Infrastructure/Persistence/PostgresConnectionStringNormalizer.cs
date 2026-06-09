using Npgsql;

namespace SwipeJobs.Infrastructure.Persistence;

public static class PostgresConnectionStringNormalizer
{
    public static string Normalize(string? connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
            return string.Empty;

        var trimmed = connectionString.Trim();
        NpgsqlConnectionStringBuilder builder;

        if (trimmed.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            || trimmed.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            builder = FromPostgresUri(trimmed);
        }
        else
        {
            builder = new NpgsqlConnectionStringBuilder(trimmed);
        }

        if (IsRenderHost(builder.Host))
        {
            builder.SslMode = SslMode.Require;
            builder.TrustServerCertificate = true;
        }

        return builder.ConnectionString;
    }

    public static string DescribeForLogs(string? connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
            return "empty";

        try
        {
            var normalized = Normalize(connectionString);
            var builder = new NpgsqlConnectionStringBuilder(normalized);
            return $"Host={builder.Host};Port={builder.Port};Database={builder.Database};Username={builder.Username};SSL Mode={builder.SslMode};Trust Server Certificate={builder.TrustServerCertificate}";
        }
        catch (Exception ex)
        {
            return $"invalid ({ex.GetType().Name}: {ex.Message})";
        }
    }

    private static NpgsqlConnectionStringBuilder FromPostgresUri(string uriValue)
    {
        var uri = new Uri(uriValue);
        var userInfo = uri.UserInfo.Split(':', 2);

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri is { IsDefaultPort: true } ? 5432 : uri.Port,
            Database = uri.AbsolutePath.TrimStart('/'),
            Username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : string.Empty,
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
        };

        ApplyUriQueryParameters(uri, builder);

        return builder;
    }

    private static void ApplyUriQueryParameters(Uri uri, NpgsqlConnectionStringBuilder builder)
    {
        if (string.IsNullOrEmpty(uri.Query))
            return;

        foreach (var part in uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var pair = part.Split('=', 2);
            if (pair.Length != 2)
                continue;

            var key = Uri.UnescapeDataString(pair[0]);
            var value = Uri.UnescapeDataString(pair[1]);

            if (key.Equals("sslmode", StringComparison.OrdinalIgnoreCase)
                && value.Equals("require", StringComparison.OrdinalIgnoreCase))
            {
                builder.SslMode = SslMode.Require;
            }
        }
    }

    private static bool IsRenderHost(string? host)
        => !string.IsNullOrWhiteSpace(host)
           && host.Contains("render.com", StringComparison.OrdinalIgnoreCase);
}
