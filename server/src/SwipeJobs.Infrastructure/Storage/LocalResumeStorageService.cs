using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SwipeJobs.Application.Common.Interfaces;

namespace SwipeJobs.Infrastructure.Storage;

public class LocalResumeStorageService : IResumeStorageService
{
    private readonly string _basePath;
    private readonly ILogger<LocalResumeStorageService> _logger;

    public LocalResumeStorageService(IConfiguration configuration, ILogger<LocalResumeStorageService> logger)
    {
        _logger = logger;
        _basePath = configuration["ResumeStorage:BasePath"]?.Trim()
            ?? Path.Combine(AppContext.BaseDirectory, "App_Data", "resumes");
        Directory.CreateDirectory(_basePath);
    }

    public async Task<string> SaveAsync(
        Guid profileId,
        Stream content,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var ext = Path.GetExtension(Path.GetFileName(fileName));
        if (string.IsNullOrWhiteSpace(ext))
        {
            ext = contentType switch
            {
                "application/pdf" => ".pdf",
                "application/msword" => ".doc",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" => ".docx",
                _ => ".bin",
            };
        }

        var storageKey = $"{profileId}/{Guid.NewGuid():N}{ext}";
        var fullPath = GetFullPath(storageKey);
        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        await using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None);
        await content.CopyToAsync(fileStream, cancellationToken);

        _logger.LogInformation("Resume saved storageKey={StorageKey} bytes={Bytes}", storageKey, fileStream.Length);
        return storageKey;
    }

    public Task<(Stream Content, string ContentType, string FileName)?> OpenReadAsync(
        string storageKey,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(storageKey) || storageKey.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            return Task.FromResult<(Stream Content, string ContentType, string FileName)?>(null);

        var fullPath = GetFullPath(storageKey);
        if (!File.Exists(fullPath))
            return Task.FromResult<(Stream Content, string ContentType, string FileName)?>(null);

        var ext = Path.GetExtension(fullPath).ToLowerInvariant();
        var contentType = ext switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            _ => "application/octet-stream",
        };

        Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        var downloadName = Path.GetFileName(fullPath);
        return Task.FromResult<(Stream Content, string ContentType, string FileName)?>((stream, contentType, downloadName));
    }

    public Task DeleteAsync(string? storageKey, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(storageKey) || storageKey.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            return Task.CompletedTask;

        var fullPath = GetFullPath(storageKey);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("Resume deleted storageKey={StorageKey}", storageKey);
        }

        return Task.CompletedTask;
    }

    private string GetFullPath(string storageKey)
    {
        var normalized = storageKey.Replace('\\', '/').TrimStart('/');
        if (normalized.Contains("..", StringComparison.Ordinal))
            throw new InvalidOperationException("Invalid storage key.");

        return Path.GetFullPath(Path.Combine(_basePath, normalized.Replace('/', Path.DirectorySeparatorChar)));
    }
}
