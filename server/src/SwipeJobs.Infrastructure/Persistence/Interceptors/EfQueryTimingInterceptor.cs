using System.Data.Common;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore.Diagnostics;
using SwipeJobs.Application.Common.Performance;

namespace SwipeJobs.Infrastructure.Persistence.Interceptors;

/// <summary>
/// Accumulates EF command execution time into <see cref="RequestPerformanceTracker"/> when perf profiling is active.
/// </summary>
public sealed class EfQueryTimingInterceptor : DbCommandInterceptor
{
    public override DbDataReader ReaderExecuted(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result)
    {
        Record(eventData);
        return base.ReaderExecuted(command, eventData, result);
    }

    public override object? ScalarExecuted(
        DbCommand command,
        CommandExecutedEventData eventData,
        object? result)
    {
        Record(eventData);
        return base.ScalarExecuted(command, eventData, result);
    }

    public override int NonQueryExecuted(
        DbCommand command,
        CommandExecutedEventData eventData,
        int result)
    {
        Record(eventData);
        return base.NonQueryExecuted(command, eventData, result);
    }

    public override ValueTask<DbDataReader> ReaderExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result,
        CancellationToken cancellationToken = default)
    {
        Record(eventData);
        return base.ReaderExecutedAsync(command, eventData, result, cancellationToken);
    }

    public override ValueTask<object?> ScalarExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        object? result,
        CancellationToken cancellationToken = default)
    {
        Record(eventData);
        return base.ScalarExecutedAsync(command, eventData, result, cancellationToken);
    }

    public override ValueTask<int> NonQueryExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        Record(eventData);
        return base.NonQueryExecutedAsync(command, eventData, result, cancellationToken);
    }

    private static void Record(CommandExecutedEventData eventData)
    {
        var tracker = RequestPerformanceTracker.CurrentTracker;
        if (tracker is null)
            return;

        var ms = (long)eventData.Duration.TotalMilliseconds;
        tracker.AddDatabase(ms);
    }
}
