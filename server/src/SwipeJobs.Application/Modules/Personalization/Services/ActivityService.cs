using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Modules.Personalization.Interfaces;
using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Modules.Personalization.Services;

public class ActivityService : IActivityService
{
    private readonly IUserActivityRepository _activityRepository;
    private readonly IUserProfileRepository _profileRepository;
    private readonly IInterestService _interestService;
    private readonly IUnitOfWork _unitOfWork;

    public ActivityService(
        IUserActivityRepository activityRepository,
        IUserProfileRepository profileRepository,
        IInterestService interestService,
        IUnitOfWork unitOfWork)
    {
        _activityRepository = activityRepository;
        _profileRepository = profileRepository;
        _interestService = interestService;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserActivityDto> RecordAsync(RecordActivityDto dto, CancellationToken cancellationToken = default)
    {
        _ = await _profileRepository.GetByIdAsync(dto.UserProfileId, cancellationToken)
            ?? throw new KeyNotFoundException("Profile not found.");

        var activity = new UserActivity
        {
            UserProfileId = dto.UserProfileId,
            ActivityType = dto.ActivityType,
            JobId = dto.JobId,
            CompanyId = dto.CompanyId,
            OccurredAt = DateTime.UtcNow,
        };

        await _activityRepository.AddAsync(activity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (dto.ActivityType is ActivityType.JobSaved or ActivityType.JobApplied
            or ActivityType.JobSkipped or ActivityType.JobViewed)
        {
            await _interestService.RecalculateAsync(dto.UserProfileId, cancellationToken);
        }

        return new UserActivityDto(activity.Id, activity.ActivityType, activity.JobId, activity.CompanyId, activity.OccurredAt);
    }

    public Task<IReadOnlyList<Guid>> GetRecentViewedJobIdsAsync(
        Guid userProfileId, int limit, CancellationToken cancellationToken = default)
        => _activityRepository.GetRecentViewedJobIdsAsync(userProfileId, limit, cancellationToken);
}
