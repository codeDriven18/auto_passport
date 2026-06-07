using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Common.Mapping;
using SwipeJobs.Application.Modules.Personalization.Interfaces;
using SwipeJobs.Application.Modules.SavedJobs.Interfaces;
using SwipeJobs.Domain.Enums;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Modules.SavedJobs.Services;

public class SavedJobService : ISavedJobService
{
    private readonly ISavedJobRepository _savedJobRepository;
    private readonly IJobRepository _jobRepository;
    private readonly IActivityService _activityService;
    private readonly IUnitOfWork _unitOfWork;

    public SavedJobService(
        ISavedJobRepository savedJobRepository,
        IJobRepository jobRepository,
        IActivityService activityService,
        IUnitOfWork unitOfWork)
    {
        _savedJobRepository = savedJobRepository;
        _jobRepository = jobRepository;
        _activityService = activityService;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SavedJobDto>> GetByUserProfileIdAsync(
        Guid userProfileId,
        CancellationToken cancellationToken = default)
    {
        var saved = await _savedJobRepository.GetByUserProfileIdAsync(userProfileId, cancellationToken);
        return saved.Select(s =>
        {
            var jobDto = s.Job is not null ? JobMapper.ToDto(s.Job) : null;
            return ProfileMapper.ToDto(s, jobDto);
        }).ToList();
    }

    public async Task<SavedJobDto> SaveAsync(CreateSavedJobDto dto, CancellationToken cancellationToken = default)
    {
        var existing = await _savedJobRepository.GetByUserAndJobAsync(
            dto.UserProfileId, dto.JobId, cancellationToken);
        if (existing is not null)
        {
            var job = await _jobRepository.GetByIdWithDetailsAsync(dto.JobId, cancellationToken);
            return ProfileMapper.ToDto(existing, job is not null ? JobMapper.ToDto(job) : null);
        }

        var jobEntity = await _jobRepository.GetByIdWithDetailsAsync(dto.JobId, cancellationToken)
            ?? throw new KeyNotFoundException("Job not found.");

        var savedJob = new SavedJob
        {
            UserProfileId = dto.UserProfileId,
            JobId = dto.JobId,
            SavedAt = DateTime.UtcNow,
        };

        await _savedJobRepository.AddAsync(savedJob, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityService.RecordAsync(new RecordActivityDto(
            dto.UserProfileId, ActivityType.JobSaved, dto.JobId, jobEntity.CompanyId), cancellationToken);

        return ProfileMapper.ToDto(savedJob, JobMapper.ToDto(jobEntity));
    }

    public async Task<bool> UnsaveAsync(Guid id, Guid userProfileId, CancellationToken cancellationToken = default)
    {
        var saved = await _savedJobRepository.GetByIdAsync(id, cancellationToken);
        if (saved is null || saved.UserProfileId != userProfileId) return false;

        await _savedJobRepository.DeleteAsync(saved, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> UnsaveByJobAsync(Guid userProfileId, Guid jobId, CancellationToken cancellationToken = default)
    {
        var saved = await _savedJobRepository.GetByUserAndJobAsync(userProfileId, jobId, cancellationToken);
        if (saved is null) return false;

        await _savedJobRepository.DeleteAsync(saved, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
