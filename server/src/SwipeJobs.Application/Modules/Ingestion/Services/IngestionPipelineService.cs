using System.Text.Json;
using SwipeJobs.Application.Common;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

public class IngestionPipelineService
{
    private readonly IIngestionMessageRepository _messageRepository;
    private readonly IJobCandidateRepository _candidateRepository;
    private readonly ISourceRepository _sourceRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly JobExtractionService _extractionService;
    private readonly JobNormalizer _normalizer;
    private readonly JobQualityScoringService _qualityScoring;

    public IngestionPipelineService(
        IIngestionMessageRepository messageRepository,
        IJobCandidateRepository candidateRepository,
        ISourceRepository sourceRepository,
        IUnitOfWork unitOfWork,
        JobExtractionService extractionService,
        JobNormalizer normalizer,
        JobQualityScoringService qualityScoring)
    {
        _messageRepository = messageRepository;
        _candidateRepository = candidateRepository;
        _sourceRepository = sourceRepository;
        _unitOfWork = unitOfWork;
        _extractionService = extractionService;
        _normalizer = normalizer;
        _qualityScoring = qualityScoring;
    }

    public async Task<(JobCandidate Candidate, bool IsDuplicate)> ProcessTelegramMessageAsync(
        TelegramIngestMessageDto dto,
        CancellationToken cancellationToken = default)
    {
        var source = await _sourceRepository.GetByIdAsync(dto.SourceId, cancellationToken)
            ?? throw new InvalidOperationException("Source not found.");

        if (!source.IngestionEnabled)
            throw new InvalidOperationException("Ingestion is disabled for this source.");

        var externalKey = $"telegram:{dto.TelegramMessageId}";

        var existingMessage = await _messageRepository.GetByExternalKeyAsync(dto.SourceId, externalKey, cancellationToken);
        if (existingMessage is not null)
        {
            var link = existingMessage.CandidateLinks.FirstOrDefault();
            if (link?.JobCandidate is not null)
                return (link.JobCandidate, true);
        }

        var message = new IngestionMessage
        {
            SourceId = dto.SourceId,
            ExternalSourceKey = externalKey,
            TelegramMessageId = dto.TelegramMessageId,
            TelegramMessageUrl = dto.TelegramMessageUrl,
            ChannelName = dto.ChannelName ?? source.ChannelName,
            ChannelUrl = dto.ChannelUrl ?? source.ChannelUrl,
            PostedAt = dto.PostedAt ?? DateTime.UtcNow,
            RawMessageText = dto.RawMessageText,
            RawMediaUrlsJson = dto.RawMediaUrls is { Count: > 0 }
                ? JsonSerializer.Serialize(dto.RawMediaUrls)
                : null,
            Status = IngestionMessageStatus.Processing,
        };

        await _messageRepository.AddAsync(message, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            var extracted = _extractionService.Extract(dto.RawMessageText);
            var normalized = _normalizer.Normalize(extracted);
            var (completeness, trust, spam) = _qualityScoring.Score(normalized, source.TrustScore, dto.RawMessageText);

            var fingerprint = JobContentFingerprint.ComputeForCandidate(
                normalized.Title,
                normalized.CompanyName,
                normalized.City ?? normalized.Location,
                normalized.ApplyUrl);

            var existingCandidate = await _candidateRepository.FindByContentFingerprintAsync(fingerprint, cancellationToken);
            JobCandidate candidate;
            var isDuplicate = existingCandidate is not null &&
                existingCandidate.Status is CandidateJobStatus.PendingReview or CandidateJobStatus.Approved;

        if (isDuplicate && existingCandidate is not null)
            {
                candidate = existingCandidate;
                candidate.MessageLinks.Add(new JobCandidateMessage
                {
                    JobCandidateId = candidate.Id,
                    IngestionMessageId = message.Id,
                    IsPrimary = false,
                });
                await _candidateRepository.UpdateAsync(candidate, cancellationToken);
            }
            else
            {
                candidate = new JobCandidate
                {
                    SourceId = dto.SourceId,
                    Status = CandidateJobStatus.PendingReview,
                    DuplicateGroupId = Guid.NewGuid(),
                    ContentFingerprint = fingerprint,
                };
                ApplyExtraction(candidate, normalized, completeness, trust, spam);
                candidate.MessageLinks.Add(new JobCandidateMessage
                {
                    IngestionMessageId = message.Id,
                    IsPrimary = true,
                });
                await _candidateRepository.AddAsync(candidate, cancellationToken);
            }

            message.Status = IngestionMessageStatus.Processed;
            source.SourceLastCheckedAt = DateTime.UtcNow;
            await _sourceRepository.UpdateAsync(source, cancellationToken);
            await _messageRepository.UpdateAsync(message, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var loaded = await _candidateRepository.GetByIdWithDetailsAsync(candidate.Id, cancellationToken);
            return (loaded ?? candidate, isDuplicate);
        }
        catch (Exception ex)
        {
            message.Status = IngestionMessageStatus.Failed;
            message.ProcessingError = ex.Message;
            await _messageRepository.UpdateAsync(message, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            throw;
        }
    }

    internal static void ApplyExtraction(
        JobCandidate candidate,
        JobExtractionResult normalized,
        int completeness,
        int trust,
        int spam)
    {
        candidate.Title = normalized.Title;
        candidate.CompanyName = normalized.CompanyName;
        candidate.Description = normalized.Description;
        candidate.Location = normalized.Location;
        candidate.City = normalized.City;
        candidate.IsRemote = normalized.IsRemote ?? false;
        candidate.SalaryMin = normalized.SalaryMin;
        candidate.SalaryMax = normalized.SalaryMax;
        candidate.Category = normalized.Category;
        candidate.Level = normalized.Level;
        candidate.EmploymentType = normalized.EmploymentType;
        candidate.SkillsJson = normalized.Skills.Count > 0 ? JsonSerializer.Serialize(normalized.Skills) : null;
        candidate.ApplyMethod = normalized.ApplyMethod;
        candidate.ApplyUrl = normalized.ApplyUrl;
        candidate.ApplyEmail = normalized.ApplyEmail;
        candidate.ApplyTelegram = normalized.ApplyTelegram;
        candidate.ApplyPhone = normalized.ApplyPhone;
        candidate.ExtractionConfidence = normalized.Confidence;
        candidate.CompletenessScore = completeness;
        candidate.TrustScore = trust;
        candidate.SpamScore = spam;
    }
}
