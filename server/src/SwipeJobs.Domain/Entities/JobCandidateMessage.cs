using SwipeJobs.Domain.Common;

namespace SwipeJobs.Domain.Entities;

public class JobCandidateMessage : BaseEntity
{
    public Guid JobCandidateId { get; set; }
    public JobCandidate JobCandidate { get; set; } = null!;

    public Guid IngestionMessageId { get; set; }
    public IngestionMessage IngestionMessage { get; set; } = null!;

    public bool IsPrimary { get; set; }
}
