using System.Text.Json;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common.Mapping;

public static class IngestionMapper
{
    public static JobCandidateDto ToCandidateDto(JobCandidate candidate)
    {
        var skills = ParseSkills(candidate.SkillsJson);
        var sources = candidate.MessageLinks
            .Select(l => new JobCandidateSourceDto(
                l.IngestionMessageId,
                l.IngestionMessage?.Source?.Name ?? candidate.Source?.Name ?? "Source",
                l.IngestionMessage?.ChannelName,
                l.IngestionMessage?.TelegramMessageUrl,
                l.IngestionMessage?.PostedAt))
            .ToList();

        var primary = candidate.MessageLinks.FirstOrDefault(l => l.IsPrimary)?.IngestionMessage
            ?? candidate.MessageLinks.FirstOrDefault()?.IngestionMessage;

        return new JobCandidateDto(
            candidate.Id,
            candidate.SourceId,
            candidate.Source?.Name ?? "Source",
            candidate.Status,
            candidate.Title,
            candidate.CompanyName,
            candidate.Description,
            candidate.Location,
            candidate.City,
            candidate.IsRemote,
            candidate.SalaryMin,
            candidate.SalaryMax,
            candidate.Category,
            candidate.Level,
            candidate.EmploymentType,
            skills,
            candidate.ApplyMethod,
            candidate.ApplyUrl,
            candidate.ApplyEmail,
            candidate.ApplyTelegram,
            candidate.ApplyPhone,
            candidate.ExtractionConfidence,
            candidate.CompletenessScore,
            candidate.TrustScore,
            candidate.SpamScore,
            candidate.DuplicateGroupId,
            candidate.MessageLinks.Count,
            sources,
            primary is null ? null : ToMessageDto(primary),
            candidate.PublishedJobId,
            candidate.RejectedReason,
            candidate.CreatedAt);
    }

    public static IngestionMessageDto ToMessageDto(IngestionMessage message) => new(
        message.Id,
        message.SourceId,
        message.Source?.Name ?? "Source",
        message.ExternalSourceKey,
        message.TelegramMessageId,
        message.TelegramMessageUrl,
        message.ChannelName,
        message.ChannelUrl,
        message.PostedAt,
        message.RawMessageText,
        ParseMediaUrls(message.RawMediaUrlsJson),
        message.Status,
        message.CreatedAt);

    private static IReadOnlyList<string> ParseSkills(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return Array.Empty<string>();
        try { return JsonSerializer.Deserialize<List<string>>(json) ?? []; }
        catch { return Array.Empty<string>(); }
    }

    private static IReadOnlyList<string> ParseMediaUrls(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return Array.Empty<string>();
        try { return JsonSerializer.Deserialize<List<string>>(json) ?? []; }
        catch { return Array.Empty<string>(); }
    }
}
