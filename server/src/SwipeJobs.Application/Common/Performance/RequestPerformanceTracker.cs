namespace SwipeJobs.Application.Common.Performance;

/// <summary>
/// Per-request accumulator for database and external storage timings (enabled via SWIPEJOBS_PERF=1).
/// </summary>
public sealed class RequestPerformanceTracker
{
    private static readonly AsyncLocal<RequestPerformanceTracker?> Current = new();

    private long _databaseMs;
    private long _storageMs;

    public static RequestPerformanceTracker? CurrentTracker => Current.Value;

    public long DatabaseMs => Interlocked.Read(ref _databaseMs);

    public long StorageMs => Interlocked.Read(ref _storageMs);

    public void AddDatabase(long milliseconds)
    {
        if (milliseconds > 0)
            Interlocked.Add(ref _databaseMs, milliseconds);
    }

    public void AddStorage(long milliseconds)
    {
        if (milliseconds > 0)
            Interlocked.Add(ref _storageMs, milliseconds);
    }

    public static RequestPerformanceScope BeginScope() => new();

    public sealed class RequestPerformanceScope : IDisposable
    {
        public RequestPerformanceScope()
        {
            Current.Value = new RequestPerformanceTracker();
        }

        public void Dispose()
        {
            Current.Value = null;
        }
    }
}
