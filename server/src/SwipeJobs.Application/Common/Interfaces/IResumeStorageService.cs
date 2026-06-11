namespace SwipeJobs.Application.Common.Interfaces;

public interface IResumeStorageService
{
    Task<string> SaveAsync(
        Guid profileId,
        Stream content,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default);

    Task<(Stream Content, string ContentType, string FileName)?> OpenReadAsync(
        string storageKey,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(string? storageKey, CancellationToken cancellationToken = default);
}
