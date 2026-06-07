namespace SwipeJobs.Domain.Entities;

public class JobTag
{
    public Guid JobId { get; set; }
    public Job Job { get; set; } = null!;

    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}
