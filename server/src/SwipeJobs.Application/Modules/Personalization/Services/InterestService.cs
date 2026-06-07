using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Common.Personalization;
using SwipeJobs.Application.Modules.Personalization.Interfaces;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Modules.Personalization.Services;

public class InterestService : IInterestService
{
    private readonly IUserInterestProfileRepository _interestRepository;
    private readonly IUserProfileRepository _profileRepository;
    private readonly IUserActivityRepository _activityRepository;
    private readonly ISavedJobRepository _savedJobRepository;
    private readonly IApplicationRepository _applicationRepository;
    private readonly IJobRepository _jobRepository;
    private readonly IUnitOfWork _unitOfWork;

    public InterestService(
        IUserInterestProfileRepository interestRepository,
        IUserProfileRepository profileRepository,
        IUserActivityRepository activityRepository,
        ISavedJobRepository savedJobRepository,
        IApplicationRepository applicationRepository,
        IJobRepository jobRepository,
        IUnitOfWork unitOfWork)
    {
        _interestRepository = interestRepository;
        _profileRepository = profileRepository;
        _activityRepository = activityRepository;
        _savedJobRepository = savedJobRepository;
        _applicationRepository = applicationRepository;
        _jobRepository = jobRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserInterestDto?> GetAsync(Guid userProfileId, CancellationToken cancellationToken = default)
    {
        var profile = await _interestRepository.GetByUserProfileIdAsync(userProfileId, cancellationToken);
        return profile is null ? null : InterestCalculator.ToDto(profile);
    }

    public async Task<UserInterestDto> RecalculateAsync(Guid userProfileId, CancellationToken cancellationToken = default)
    {
        var profile = await _profileRepository.GetByIdWithDetailsAsync(userProfileId, cancellationToken)
            ?? throw new KeyNotFoundException("Profile not found.");

        var activities = await _activityRepository.GetByUserProfileIdAsync(userProfileId, cancellationToken);
        var saved = await _savedJobRepository.GetByUserProfileIdAsync(userProfileId, cancellationToken);
        var applications = await _applicationRepository.GetByUserProfileIdAsync(userProfileId, cancellationToken);

        var activityJobIds = activities.Where(a => a.JobId.HasValue).Select(a => a.JobId!.Value).Distinct().ToList();
        var activityJobs = new List<Job>();
        foreach (var jobId in activityJobIds)
        {
            var job = await _jobRepository.GetByIdWithDetailsAsync(jobId, cancellationToken);
            if (job is not null) activityJobs.Add(job);
        }

        var savedJobs = saved.Where(s => s.Job is not null).Select(s => s.Job!).ToList();
        var appliedJobs = applications.Where(a => a.Job is not null).Select(a => a.Job!).ToList();

        var computed = InterestCalculator.Compute(profile, activities, activityJobs, savedJobs, appliedJobs);

        var existing = await _interestRepository.GetForUpdateAsync(userProfileId, cancellationToken);
        if (existing is null)
        {
            await _interestRepository.AddAsync(computed, cancellationToken);
        }
        else
        {
            existing.PreferredCategoriesJson = computed.PreferredCategoriesJson;
            existing.PreferredTechnologiesJson = computed.PreferredTechnologiesJson;
            existing.PreferredCitiesJson = computed.PreferredCitiesJson;
            existing.PreferredSalaryMin = computed.PreferredSalaryMin;
            existing.PreferredSalaryMax = computed.PreferredSalaryMax;
            existing.LastCalculatedAt = computed.LastCalculatedAt;
            await _interestRepository.UpdateAsync(existing, cancellationToken);
            computed = existing;
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return InterestCalculator.ToDto(computed);
    }
}
