using SwipeJobs.Application.Common;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Modules.Portal.Services;

public partial class CompanyPortalService
{
    public async Task<IReadOnlyList<PortalWorkspaceActivityDto>> GetWorkspaceActivityAsync(
        Guid companyId,
        int limit = 30,
        CancellationToken cancellationToken = default)
    {
        var cappedLimit = Math.Clamp(limit, 1, 50);
        var applications = await _applicationRepository.GetByCompanyIdAsync(companyId, null, cancellationToken);
        var jobs = await _jobRepository.GetByCompanyIdAsync(companyId, cancellationToken);
        var conversations = await _conversationRepository.GetByCompanyIdAsync(companyId, cancellationToken);
        var conversationByApplication = conversations.ToDictionary(c => c.ApplicationId, c => c.Id);

        var items = new List<PortalWorkspaceActivityDto>();

        foreach (var application in applications)
        {
            var name = $"{application.UserProfile?.FirstName} {application.UserProfile?.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(name)) name = "Candidate";
            var jobTitle = application.Job?.Title ?? "Role";
            conversationByApplication.TryGetValue(application.Id, out var conversationId);

            var timeline = ApplicationActivityLogSerializer.BuildTimeline(
                application.StatusHistoryJson,
                application.ActivityLogJson);

            foreach (var entry in timeline)
            {
                items.Add(new PortalWorkspaceActivityDto(
                    entry.Type,
                    entry.OccurredAt,
                    FormatWorkspaceActivityMessage(entry, name, jobTitle, application.InterviewScheduledAtUtc),
                    application.Id,
                    application.JobId,
                    conversationId));
            }
        }

        foreach (var job in jobs.Where(j => j.IsActive))
        {
            items.Add(new PortalWorkspaceActivityDto(
                RecruiterActivityType.Applied,
                job.CreatedAt,
                $"{job.Title} role published",
                null,
                job.Id,
                null));
        }

        foreach (var conversation in conversations)
        {
            var latest = await _messageRepository.GetLatestByConversationIdAsync(conversation.Id, cancellationToken);
            if (latest is null || latest.Type != MessageType.User) continue;

            var name = $"{conversation.CandidateProfile?.FirstName} {conversation.CandidateProfile?.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(name)) name = "Candidate";

            Guid? jobId = applications.FirstOrDefault(a => a.Id == conversation.ApplicationId)?.JobId;

            items.Add(new PortalWorkspaceActivityDto(
                RecruiterActivityType.Reviewed,
                latest.SentAt,
                $"{name} replied in chat",
                conversation.ApplicationId,
                jobId,
                conversation.Id));
        }

        return items
            .OrderByDescending(i => i.OccurredAt)
            .Take(cappedLimit)
            .ToList();
    }

    private static string FormatWorkspaceActivityMessage(
        ApplicationActivityEntry entry,
        string candidateName,
        string jobTitle,
        DateTime? interviewScheduledAtUtc)
    {
        return entry.Type switch
        {
            RecruiterActivityType.Applied =>
                $"New application received for {jobTitle}",
            RecruiterActivityType.Reviewed =>
                $"{candidateName} moved to review",
            RecruiterActivityType.Shortlisted =>
                $"{candidateName} shortlisted",
            RecruiterActivityType.InterviewScheduled when interviewScheduledAtUtc.HasValue =>
                $"Interview scheduled for {interviewScheduledAtUtc.Value:MMM d, HH:mm}",
            RecruiterActivityType.InterviewScheduled =>
                $"{candidateName} moved to Interview stage",
            RecruiterActivityType.InterviewCompleted =>
                $"Interview completed with {candidateName}",
            RecruiterActivityType.Rejected =>
                $"{candidateName} rejected",
            RecruiterActivityType.Hired =>
                $"{candidateName} hired",
            RecruiterActivityType.OfferSent =>
                $"Offer sent to {candidateName}",
            RecruiterActivityType.NoteAdded =>
                $"Note added for {candidateName}",
            RecruiterActivityType.Withdrawn =>
                $"{candidateName} withdrew application",
            _ => entry.Details ?? $"{candidateName} — {entry.Type}",
        };
    }
}
