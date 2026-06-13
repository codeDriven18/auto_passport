using SwipeJobs.Application.Common;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Common.Mapping;
using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

/// <summary>
/// Foundation for Telegram/API ingestion: normalize payloads, detect duplicates, publish jobs.
/// </summary>
public class JobIngestionService
{
    private readonly IJobRepository _jobRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly ISourceRepository _sourceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public JobIngestionService(
        IJobRepository jobRepository,
        ICompanyRepository companyRepository,
        ISourceRepository sourceRepository,
        IUnitOfWork unitOfWork)
    {
        _jobRepository = jobRepository;
        _companyRepository = companyRepository;
        _sourceRepository = sourceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<(JobDto? Published, bool IsDuplicate)> IngestAsync(
        IngestionJobDto dto,
        CancellationToken cancellationToken = default)
    {
        var source = await _sourceRepository.GetByIdAsync(dto.SourceId, cancellationToken)
            ?? throw new InvalidOperationException("Source not found.");

        if (!string.IsNullOrWhiteSpace(dto.ExternalSourceKey))
        {
            var existingByKey = await _jobRepository.FindByExternalSourceKeyAsync(
                dto.SourceId, dto.ExternalSourceKey, cancellationToken);
            if (existingByKey is not null)
                return (JobMapper.ToDto(existingByKey), true);
        }

        var company = await ResolveCompanyAsync(dto, cancellationToken);
        var fingerprint = JobContentFingerprint.Compute(
            dto.Title, company.Id, dto.City, dto.SourceId, dto.ExternalUrl);

        var existingByFingerprint = await _jobRepository.FindByContentFingerprintAsync(
            fingerprint, cancellationToken);
        if (existingByFingerprint is not null)
            return (JobMapper.ToDto(existingByFingerprint), true);

        var job = new Job
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            CompanyId = company.Id,
            Location = dto.Location,
            City = dto.City,
            Category = dto.Category,
            Level = dto.Level,
            IsRemote = dto.IsRemote,
            SalaryMin = dto.SalaryMin,
            SalaryMax = dto.SalaryMax,
            ExternalUrl = dto.ExternalUrl,
            JobImageUrl = dto.JobImageUrl,
            ExternalSourceKey = dto.ExternalSourceKey,
            ContentFingerprint = fingerprint,
            SourceId = dto.SourceId,
            IsActive = true,
        };

        await _jobRepository.AddAsync(job, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await _jobRepository.GetByIdWithDetailsAsync(job.Id, cancellationToken);
        return (created is null ? JobMapper.ToDto(job) : JobMapper.ToDto(created), false);
    }

    private async Task<Company> ResolveCompanyAsync(IngestionJobDto dto, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(dto.CompanySlug))
        {
            var bySlug = await _companyRepository.GetBySlugAsync(dto.CompanySlug, cancellationToken);
            if (bySlug is not null) return bySlug;
        }

        throw new InvalidOperationException(
            $"Company slug required for ingestion: {dto.CompanyName}");
    }
}
