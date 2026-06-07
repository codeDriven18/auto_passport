using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(
        AuditAction action,
        AuditEntityType entityType,
        Guid? entityId,
        string? details = null,
        Guid? actorUserId = null,
        string? actorEmail = null,
        CancellationToken cancellationToken = default);
}
