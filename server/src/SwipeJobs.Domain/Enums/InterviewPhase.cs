namespace SwipeJobs.Domain.Enums;

/// <summary>
/// Sub-state within the Interview pipeline column. Supports future scheduling without schema churn.
/// </summary>
public enum InterviewPhase
{
    None = 0,
    Requested = 1,
    Scheduled = 2,
    Completed = 3,
}
