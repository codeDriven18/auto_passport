namespace SwipeJobs.Domain.Enums;

/// <summary>
/// Employer-facing notification events. Delivery/UI ships in a later phase.
/// </summary>
public enum EmployerNotificationType
{
    NewApplication = 0,
    CandidateMessage = 1,
    InterviewAccepted = 2,
    InterviewCancelled = 3,
    CandidateWithdrew = 4,
    JobExpired = 5,
}
