using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Guid? ActorUserId { get; set; }
    public string Actor { get; set; } = string.Empty;
    public AuditAction Action { get; set; }
    public AuditEntityType EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public string? Details { get; set; }
}
