using SwipeJobs.Application.Common;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Common.Mapping;
using SwipeJobs.Application.Modules.Applications.Interfaces;
using SwipeJobs.Application.Modules.Personalization.Interfaces;
using SwipeJobs.Domain.Enums;
using ApplicationEntity = SwipeJobs.Domain.Entities.Application;

namespace SwipeJobs.Application.Modules.Applications.Services;

public class ApplicationService : IApplicationService
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IUserProfileRepository _profileRepository;
    private readonly IJobRepository _jobRepository;
    private readonly IActivityService _activityService;
    private readonly IUnitOfWork _unitOfWork;

    public ApplicationService(
        IApplicationRepository applicationRepository,
        IUserProfileRepository profileRepository,
        IJobRepository jobRepository,
        IActivityService activityService,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _profileRepository = profileRepository;
        _jobRepository = jobRepository;
        _activityService = activityService;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ApplicationDto>> GetByUserProfileIdAsync(
        Guid userProfileId,
        CancellationToken cancellationToken = default)
    {
        var applications = await _applicationRepository.GetByUserProfileIdAsync(userProfileId, cancellationToken);
        return applications.Select(a =>
        {
            var jobDto = a.Job is not null ? JobMapper.ToDto(a.Job) : null;
            return ProfileMapper.ToDto(a, jobDto);
        }).ToList();
    }

    public async Task<ApplicationDto> ApplyAsync(CreateApplicationDto dto, CancellationToken cancellationToken = default)
    {
        var profile = await _profileRepository.GetByIdWithDetailsAsync(dto.UserProfileId, cancellationToken)
            ?? throw new KeyNotFoundException("Profile not found.");

        ProfileCompletenessChecker.UpdateFlag(profile);
        if (!profile.IsProfileComplete)
        {
            var check = ProfileCompletenessChecker.Check(profile);
            throw new InvalidOperationException(
                $"Profile incomplete. Missing: {string.Join(", ", check.MissingFields)}");
        }

        var job = await _jobRepository.GetByIdWithDetailsAsync(dto.JobId, cancellationToken)
            ?? throw new KeyNotFoundException("Job not found.");

        if (!job.IsActive)
            throw new InvalidOperationException("Job is no longer active.");

        var existing = await _applicationRepository.GetByUserProfileIdAsync(dto.UserProfileId, cancellationToken);
        if (existing.Any(a => a.JobId == dto.JobId))
            throw new InvalidOperationException("You have already applied to this job.");

        var application = new ApplicationEntity
        {
            UserProfileId = dto.UserProfileId,
            JobId = dto.JobId,
            Status = ApplicationStatus.Submitted,
            AppliedAt = DateTime.UtcNow,
        };

        await _applicationRepository.AddAsync(application, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityService.RecordAsync(new RecordActivityDto(
            dto.UserProfileId, ActivityType.JobApplied, dto.JobId, job.CompanyId), cancellationToken);

        return ProfileMapper.ToDto(application, JobMapper.ToDto(job));
    }

    public async Task<bool> WithdrawAsync(Guid id, Guid userProfileId, CancellationToken cancellationToken = default)
    {
        var application = await _applicationRepository.GetByIdAsync(id, cancellationToken);
        if (application is null || application.UserProfileId != userProfileId) return false;

        application.Status = ApplicationStatus.Withdrawn;
        await _applicationRepository.UpdateAsync(application, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
