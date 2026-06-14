using System.Text.Json;
using Microsoft.Extensions.Logging;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Common.Mapping;
using SwipeJobs.Application.Modules.Ingestion;
using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

public interface IModerationService
{
    Task<ModerationQueueDto> GetQueueAsync(CandidateJobStatus? status, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<JobCandidateDto?> GetCandidateAsync(Guid id, CancellationToken cancellationToken = default);
    Task<JobDto?> ApproveAndPublishAsync(Guid candidateId, Guid moderatorUserId, CancellationToken cancellationToken = default);
    Task<bool> RejectAsync(Guid candidateId, Guid moderatorUserId, RejectJobCandidateDto dto, CancellationToken cancellationToken = default);
    Task<JobCandidateDto?> EditAsync(Guid candidateId, EditJobCandidateDto dto, CancellationToken cancellationToken = default);
    Task<BulkModerationActionResultDto> BulkApproveHighConfidenceAsync(Guid moderatorUserId, CancellationToken cancellationToken = default);
    Task<int> BulkRejectAsync(IReadOnlyList<Guid> ids, Guid moderatorUserId, string reason, CancellationToken cancellationToken = default);
    Task<IngestionAnalyticsDto> GetAnalyticsAsync(CancellationToken cancellationToken = default);
}

public class ModerationService : IModerationService
{
    private const int HighConfidenceThreshold = 90;
    private const int HighCompletenessThreshold = 70;
    private const int MaxSpamThreshold = 20;

    private readonly IJobCandidateRepository _candidateRepository;
    private readonly IIngestionMessageRepository _messageRepository;
    private readonly IJobRepository _jobRepository;
    private readonly IJobPublishService _publishService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ModerationService> _logger;

    public ModerationService(
        IJobCandidateRepository candidateRepository,
        IIngestionMessageRepository messageRepository,
        IJobRepository jobRepository,
        IJobPublishService publishService,
        IUnitOfWork unitOfWork,
        ILogger<ModerationService> logger)
    {
        _candidateRepository = candidateRepository;
        _messageRepository = messageRepository;
        _jobRepository = jobRepository;
        _publishService = publishService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ModerationQueueDto> GetQueueAsync(
        CandidateJobStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var filter = status ?? CandidateJobStatus.PendingReview;
        var items = await _candidateRepository.GetModerationQueueAsync(filter, page, pageSize, cancellationToken);
        var pending = await _candidateRepository.CountByStatusAsync(CandidateJobStatus.PendingReview, cancellationToken);
        var total = await _candidateRepository.CountByStatusAsync(filter, cancellationToken);

        _logger.LogInformation(
            "Moderation queue loaded. Filter={Status}, Page={Page}, PageSize={PageSize}, Returned={Returned}, Total={Total}, Pending={Pending}",
            filter,
            page,
            pageSize,
            items.Count,
            total,
            pending);

        return new ModerationQueueDto(
            items.Select(IngestionMapper.ToCandidateDto).ToList(),
            total,
            pending);
    }

    public async Task<JobCandidateDto?> GetCandidateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByIdWithDetailsAsync(id, cancellationToken);
        return candidate is null ? null : IngestionMapper.ToCandidateDto(candidate);
    }

    public async Task<JobDto?> ApproveAndPublishAsync(
        Guid candidateId,
        Guid moderatorUserId,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByIdWithDetailsAsync(candidateId, cancellationToken)
            ?? throw new ModerationException(
                ModerationErrorCodes.CandidateNotFound,
                "Candidate not found.",
                $"No candidate exists with id {candidateId}.");

        _logger.LogInformation(
            "Approve requested. CandidateId={CandidateId}, Status={Status}, Title={Title}, Company={Company}, Confidence={Confidence}",
            candidateId,
            candidate.Status,
            candidate.Title ?? "(null)",
            candidate.CompanyName ?? "(null)",
            candidate.ExtractionConfidence);

        if (candidate.Status is CandidateJobStatus.Rejected or CandidateJobStatus.Published)
        {
            throw new ModerationException(
                ModerationErrorCodes.CandidateNotApprovable,
                $"Candidate cannot be approved while status is {candidate.Status}.",
                $"CandidateId={candidateId}; CurrentStatus={candidate.Status}");
        }

        if (candidate.PublishedJobId.HasValue)
        {
            var existingJob = await _jobRepository.GetByIdWithDetailsAsync(candidate.PublishedJobId.Value, cancellationToken);
            if (existingJob is not null)
            {
                _logger.LogInformation(
                    "Candidate {CandidateId} already published as job {JobId}. Returning existing job.",
                    candidateId,
                    existingJob.Id);
                return JobMapper.ToDto(existingJob);
            }
        }

        EnsureApprovalFields(candidate);

        if (string.IsNullOrWhiteSpace(candidate.Title))
        {
            throw new ModerationException(
                ModerationErrorCodes.ApproveMissingTitle,
                "Job title is required before approval. Edit the candidate or re-ingest with clearer text.",
                $"CandidateId={candidateId}; DescriptionPresent={!string.IsNullOrWhiteSpace(candidate.Description)}");
        }

        if (string.IsNullOrWhiteSpace(candidate.CompanyName))
        {
            throw new ModerationException(
                ModerationErrorCodes.ApproveMissingCompany,
                "Company name is required before approval. Edit the candidate or ensure the source has a channel name.",
                $"CandidateId={candidateId}; SourceId={candidate.SourceId}");
        }

        var previousStatus = candidate.Status;
        candidate.Status = CandidateJobStatus.Approved;
        candidate.ApprovedByUserId = moderatorUserId;
        candidate.ApprovedAt = DateTime.UtcNow;
        await _candidateRepository.UpdateAsync(candidate, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            var job = await _publishService.PublishCandidateAsync(candidateId, moderatorUserId, cancellationToken);
            _logger.LogInformation(
                "Candidate approved and published. CandidateId={CandidateId}, JobId={JobId}, PreviousStatus={PreviousStatus}, NewStatus=Published",
                candidateId,
                job?.Id,
                previousStatus);
            return job;
        }
        catch (Exception ex)
        {
            candidate.Status = CandidateJobStatus.PendingReview;
            candidate.ApprovedByUserId = null;
            candidate.ApprovedAt = null;
            await _candidateRepository.UpdateAsync(candidate, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var details = ex.InnerException?.Message ?? ex.Message;
            _logger.LogError(
                ex,
                "Publish failed after approval. CandidateId={CandidateId}, PreviousStatus={PreviousStatus}, RolledBackTo=PendingReview",
                candidateId,
                previousStatus);

            throw ex switch
            {
                ModerationException moderationEx => moderationEx,
                _ => new ModerationException(
                    ModerationErrorCodes.PublishFailed,
                    "Publishing failed. The candidate was returned to the review queue.",
                    details,
                    ex),
            };
        }
    }

    public async Task<bool> RejectAsync(
        Guid candidateId,
        Guid moderatorUserId,
        RejectJobCandidateDto dto,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByIdWithDetailsAsync(candidateId, cancellationToken);
        if (candidate is null) return false;

        candidate.Status = CandidateJobStatus.Rejected;
        candidate.RejectedByUserId = moderatorUserId;
        candidate.RejectedAt = DateTime.UtcNow;
        candidate.RejectedReason = dto.Reason;
        await _candidateRepository.UpdateAsync(candidate, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<JobCandidateDto?> EditAsync(
        Guid candidateId,
        EditJobCandidateDto dto,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByIdWithDetailsAsync(candidateId, cancellationToken);
        if (candidate is null) return null;

        if (dto.Title is not null) candidate.Title = dto.Title;
        if (dto.CompanyName is not null) candidate.CompanyName = dto.CompanyName;
        if (dto.Description is not null) candidate.Description = dto.Description;
        if (dto.Location is not null) candidate.Location = dto.Location;
        if (dto.City is not null) candidate.City = dto.City;
        if (dto.IsRemote.HasValue) candidate.IsRemote = dto.IsRemote.Value;
        if (dto.SalaryMin.HasValue) candidate.SalaryMin = dto.SalaryMin;
        if (dto.SalaryMax.HasValue) candidate.SalaryMax = dto.SalaryMax;
        if (dto.Category.HasValue) candidate.Category = dto.Category.Value;
        if (dto.Level.HasValue) candidate.Level = dto.Level.Value;
        if (dto.EmploymentType is not null) candidate.EmploymentType = dto.EmploymentType;
        if (dto.Skills is not null) candidate.SkillsJson = JsonSerializer.Serialize(dto.Skills);
        if (dto.ApplyMethod.HasValue) candidate.ApplyMethod = dto.ApplyMethod.Value;
        if (dto.ApplyUrl is not null) candidate.ApplyUrl = dto.ApplyUrl;
        if (dto.ApplyEmail is not null) candidate.ApplyEmail = dto.ApplyEmail;
        if (dto.ApplyTelegram is not null) candidate.ApplyTelegram = dto.ApplyTelegram;
        if (dto.ApplyPhone is not null) candidate.ApplyPhone = dto.ApplyPhone;

        await _candidateRepository.UpdateAsync(candidate, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await _candidateRepository.GetByIdWithDetailsAsync(candidateId, cancellationToken);
        return updated is null ? null : IngestionMapper.ToCandidateDto(updated);
    }

    public async Task<BulkModerationActionResultDto> BulkApproveHighConfidenceAsync(
        Guid moderatorUserId,
        CancellationToken cancellationToken = default)
    {
        var queue = await _candidateRepository.GetModerationQueueAsync(
            CandidateJobStatus.PendingReview, 1, 500, cancellationToken);

        var eligible = queue.Where(c =>
            c.ExtractionConfidence >= HighConfidenceThreshold &&
            c.CompletenessScore >= HighCompletenessThreshold &&
            c.SpamScore <= MaxSpamThreshold).ToList();

        _logger.LogInformation(
            "Bulk approve high-confidence started. Pending={Pending}, Eligible={Eligible}",
            queue.Count,
            eligible.Count);

        var results = new List<ModerationActionResultDto>();
        var approved = 0;

        foreach (var candidate in eligible)
        {
            try
            {
                var job = await ApproveAndPublishAsync(candidate.Id, moderatorUserId, cancellationToken);
                approved++;
                results.Add(new ModerationActionResultDto(
                    true,
                    null,
                    "Approved and published.",
                    null,
                    candidate.Id,
                    job?.Id,
                    CandidateJobStatus.Published.ToString()));
            }
            catch (ModerationException ex)
            {
                _logger.LogWarning(
                    ex,
                    "Bulk approve failed for candidate {CandidateId}. Code={Code}",
                    candidate.Id,
                    ex.Code);
                results.Add(new ModerationActionResultDto(
                    false,
                    ex.Code,
                    ex.Message,
                    ex.Details,
                    candidate.Id,
                    null,
                    candidate.Status.ToString()));
            }
        }

        _logger.LogInformation(
            "Bulk approve high-confidence finished. Approved={Approved}, Failed={Failed}",
            approved,
            results.Count - approved);

        return new BulkModerationActionResultDto(approved, results.Count - approved, results);
    }

    public async Task<int> BulkRejectAsync(
        IReadOnlyList<Guid> ids,
        Guid moderatorUserId,
        string reason,
        CancellationToken cancellationToken = default)
    {
        var count = 0;
        foreach (var id in ids)
        {
            if (await RejectAsync(id, moderatorUserId, new RejectJobCandidateDto(reason), cancellationToken))
                count++;
        }
        return count;
    }

    public async Task<IngestionAnalyticsDto> GetAnalyticsAsync(CancellationToken cancellationToken = default)
    {
        var messages = await _messageRepository.CountAsync(cancellationToken);
        var candidates = await _candidateRepository.CountAsync(cancellationToken);
        var pending = await _candidateRepository.CountByStatusAsync(CandidateJobStatus.PendingReview, cancellationToken);
        var approved = await _candidateRepository.CountByStatusAsync(CandidateJobStatus.Approved, cancellationToken);
        var rejected = await _candidateRepository.CountByStatusAsync(CandidateJobStatus.Rejected, cancellationToken);
        var published = await _candidateRepository.CountByStatusAsync(CandidateJobStatus.Published, cancellationToken);

        var queue = await _candidateRepository.GetModerationQueueAsync(CandidateJobStatus.PendingReview, 1, 1000, cancellationToken);
        var avgConfidence = queue.Count > 0 ? queue.Average(c => c.ExtractionConfidence) : 0;
        var avgTrust = queue.Count > 0 ? queue.Average(c => c.TrustScore) : 0;

        var leaderboard = queue
            .GroupBy(c => new
            {
                c.SourceId,
                Name = c.Source?.Name ?? "Unknown",
                TrustScore = c.Source?.TrustScore ?? 0,
            })
            .Select(g => new SourceLeaderboardEntryDto(
                g.Key.SourceId,
                g.Key.Name,
                g.Sum(c => c.MessageLinks.Count),
                g.Count(c => c.Status == CandidateJobStatus.Published),
                g.Count(c => c.Status == CandidateJobStatus.Approved),
                g.Count(c => c.Status == CandidateJobStatus.Rejected),
                g.Average(c => c.ExtractionConfidence),
                g.Key.TrustScore))
            .OrderByDescending(x => x.Published)
            .Take(10)
            .ToList();

        return new IngestionAnalyticsDto(
            messages,
            candidates,
            Math.Max(0, candidates - pending),
            approved,
            rejected,
            published,
            0,
            0,
            avgConfidence,
            avgTrust,
            leaderboard);
    }

    private static void EnsureApprovalFields(JobCandidate candidate)
    {
        if (string.IsNullOrWhiteSpace(candidate.Title) && !string.IsNullOrWhiteSpace(candidate.Description))
        {
            var firstLine = candidate.Description
                .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .FirstOrDefault();
            candidate.Title = firstLine is { Length: > 300 } ? firstLine[..300] : firstLine;
        }

        if (string.IsNullOrWhiteSpace(candidate.CompanyName))
        {
            candidate.CompanyName = candidate.Source?.ChannelName
                ?? candidate.Source?.Name
                ?? candidate.MessageLinks.FirstOrDefault()?.IngestionMessage?.ChannelName;
        }
    }
}
