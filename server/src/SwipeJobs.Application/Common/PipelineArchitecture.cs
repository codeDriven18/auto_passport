using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common;

/// <summary>
/// Canonical hiring pipeline model for employer UX. Kanban UI maps to these columns.
/// </summary>
public static class PipelineArchitecture
{
    public enum Column
    {
        Applied,
        Reviewing,
        Shortlisted,
        Interview,
        Offer,
        Hired,
        Rejected,
    }

    public static Column ResolveColumn(ApplicationStatus status, InterviewPhase interviewPhase)
    {
        return status switch
        {
            ApplicationStatus.Pending or ApplicationStatus.Applied => Column.Applied,
            ApplicationStatus.UnderReview => Column.Reviewing,
            ApplicationStatus.Shortlisted => Column.Shortlisted,
            ApplicationStatus.InterviewInvited or ApplicationStatus.Interviewing => Column.Interview,
            ApplicationStatus.OfferSent => Column.Offer,
            ApplicationStatus.Hired => Column.Hired,
            ApplicationStatus.Rejected or ApplicationStatus.Withdrawn => Column.Rejected,
            _ => Column.Applied,
        };
    }

    /// <summary>
    /// Interview column uses InterviewPhase for requested / scheduled / completed before offer.
    /// </summary>
    public static InterviewPhase ResolveInterviewPhase(ApplicationStatus status, InterviewPhase storedPhase)
    {
        if (status is not (ApplicationStatus.InterviewInvited or ApplicationStatus.Interviewing))
            return InterviewPhase.None;

        return storedPhase switch
        {
            InterviewPhase.Scheduled or InterviewPhase.Completed or InterviewPhase.Requested => storedPhase,
            _ => status == ApplicationStatus.InterviewInvited
                ? InterviewPhase.Requested
                : InterviewPhase.None,
        };
    }

    public static IReadOnlyList<Column> OrderedColumns { get; } =
    [
        Column.Applied,
        Column.Reviewing,
        Column.Shortlisted,
        Column.Interview,
        Column.Offer,
        Column.Hired,
        Column.Rejected,
    ];
}
