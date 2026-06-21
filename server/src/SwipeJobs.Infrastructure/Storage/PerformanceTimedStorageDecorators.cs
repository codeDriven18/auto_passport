using System.Diagnostics;
using SwipeJobs.Application.Common.Performance;
using SwipeJobs.Application.Common.Interfaces;

namespace SwipeJobs.Infrastructure.Storage;

internal static class PerformanceTimedStorage
{
    internal static void Record(long milliseconds)
    {
        RequestPerformanceTracker.CurrentTracker?.AddStorage(milliseconds);
    }

    internal static async Task<T> MeasureAsync<T>(Func<Task<T>> action)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            return await action();
        }
        finally
        {
            sw.Stop();
            Record(sw.ElapsedMilliseconds);
        }
    }

    internal static async Task MeasureAsync(Func<Task> action)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            await action();
        }
        finally
        {
            sw.Stop();
            Record(sw.ElapsedMilliseconds);
        }
    }
}

internal sealed class TimedResumeStorageService(IResumeStorageService inner) : IResumeStorageService
{
    public Task<string> SaveAsync(
        Guid profileId,
        Stream content,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default) =>
        PerformanceTimedStorage.MeasureAsync(() =>
            inner.SaveAsync(profileId, content, fileName, contentType, cancellationToken));

    public Task<(Stream Content, string ContentType, string FileName)?> OpenReadAsync(
        string storageKey,
        CancellationToken cancellationToken = default) =>
        PerformanceTimedStorage.MeasureAsync(() =>
            inner.OpenReadAsync(storageKey, cancellationToken));

    public Task DeleteAsync(string? storageKey, CancellationToken cancellationToken = default) =>
        PerformanceTimedStorage.MeasureAsync(() =>
            inner.DeleteAsync(storageKey, cancellationToken));
}

internal sealed class TimedMessageAttachmentStorage(IMessageAttachmentStorage inner) : IMessageAttachmentStorage
{
    public Task<string> SaveAsync(
        Guid conversationId,
        Stream content,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default) =>
        PerformanceTimedStorage.MeasureAsync(() =>
            inner.SaveAsync(conversationId, content, fileName, contentType, cancellationToken));

    public Task<(Stream Content, string ContentType, string FileName)?> OpenReadAsync(
        string storageKey,
        CancellationToken cancellationToken = default) =>
        PerformanceTimedStorage.MeasureAsync(() =>
            inner.OpenReadAsync(storageKey, cancellationToken));
}
