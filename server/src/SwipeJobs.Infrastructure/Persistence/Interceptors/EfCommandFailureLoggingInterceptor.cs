using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Npgsql;

namespace SwipeJobs.Infrastructure.Persistence.Interceptors;

/// <summary>
/// Logs the complete DbCommand text when EF Core reports a command failure.
/// Default EF logging truncates long CREATE statements (e.g. migration DDL).
/// </summary>
public sealed class EfCommandFailureLoggingInterceptor : DbCommandInterceptor
{
    public override void CommandFailed(DbCommand command, CommandErrorEventData eventData)
    {
        LogFailedCommand(command, eventData.Exception);
        base.CommandFailed(command, eventData);
    }

    public override Task CommandFailedAsync(
        DbCommand command,
        CommandErrorEventData eventData,
        CancellationToken cancellationToken = default)
    {
        LogFailedCommand(command, eventData.Exception);
        return base.CommandFailedAsync(command, eventData, cancellationToken);
    }

    private static void LogFailedCommand(DbCommand command, Exception exception)
    {
        var commandText = command.CommandText ?? string.Empty;

        Console.Error.WriteLine("[EF SQL FAILED] DbCommand execution failed.");
        Console.Error.WriteLine(
            $"[EF SQL FAILED] CommandType={command.CommandType}; Timeout={command.CommandTimeout}s; Length={commandText.Length} chars");

        if (command.Parameters.Count > 0)
        {
            Console.Error.WriteLine("[EF SQL FAILED] Parameters:");
            foreach (DbParameter parameter in command.Parameters)
            {
                Console.Error.WriteLine(
                    $"  {parameter.ParameterName}={parameter.Value ?? "NULL"} ({parameter.DbType})");
            }
        }

        Console.Error.WriteLine("[EF SQL FAILED] Full CommandText:");
        Console.Error.WriteLine(commandText);

        Console.Error.WriteLine($"[EF SQL FAILED] Exception: {exception.GetType().Name}: {exception.Message}");

        if (exception is PostgresException pg)
        {
            Console.Error.WriteLine(
                $"[EF SQL FAILED] PostgresException SqlState={pg.SqlState}; Position={pg.Position}; MessageText={pg.MessageText}");
        }
    }
}
