using System.Security.Cryptography;
using System.Text;

namespace SwipeJobs.Application.Common;

/// <summary>
/// Normalized fingerprint for duplicate detection during ingestion pipelines.
/// </summary>
public static class JobContentFingerprint
{
    public static string Compute(
        string title,
        Guid companyId,
        string? city,
        Guid sourceId,
        string? externalUrl)
    {
        var normalized = string.Join('|', new[]
        {
            Normalize(title),
            companyId.ToString("N"),
            Normalize(city ?? string.Empty),
            sourceId.ToString("N"),
            Normalize(externalUrl ?? string.Empty),
        });

        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(normalized));
        return Convert.ToHexString(hash);
    }

    /// <summary>Cross-source fingerprint for candidate deduplication before company resolution.</summary>
    public static string ComputeForCandidate(
        string? title,
        string? companyName,
        string? city,
        string? applyUrl)
    {
        var normalized = string.Join('|', new[]
        {
            Normalize(title ?? string.Empty),
            Normalize(companyName ?? string.Empty),
            Normalize(city ?? string.Empty),
            Normalize(applyUrl ?? string.Empty),
        });

        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(normalized));
        return Convert.ToHexString(hash);
    }

    private static string Normalize(string value) =>
        string.Join(' ', value.Trim().ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries));
}
