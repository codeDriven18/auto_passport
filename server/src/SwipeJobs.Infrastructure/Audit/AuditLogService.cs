using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Infrastructure.Audit;

public class AuditLogService : IAuditLogService
{
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public AuditLogService(
        IAuditLogRepository auditLogRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _auditLogRepository = auditLogRepository;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task LogAsync(
        AuditAction action,
        AuditEntityType entityType,
        Guid? entityId,
        string? details = null,
        Guid? actorUserId = null,
        string? actorEmail = null,
        CancellationToken cancellationToken = default)
    {
        var resolvedActorId = actorUserId ?? _currentUser.UserId;
        var resolvedActor = actorEmail
            ?? _currentUser.UserId?.ToString()
            ?? "system";

        var log = new AuditLog
        {
            ActorUserId = resolvedActorId,
            Actor = resolvedActor,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            Timestamp = DateTime.UtcNow,
        };

        await _auditLogRepository.AddAsync(log, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
