namespace SwipeJobs.Domain.Enums;

public enum JobLifecycleStatus
{
    PendingReview = 0,
    Published = 1,
    Paused = 2,
    Expired = 3,
    Filled = 4,
    Rejected = 5,
    Archived = 6,
}
