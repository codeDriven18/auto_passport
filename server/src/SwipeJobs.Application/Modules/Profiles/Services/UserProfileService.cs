using SwipeJobs.Application.Common;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Common.Mapping;
using SwipeJobs.Application.Modules.Profiles.Interfaces;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Modules.Profiles.Services;

public class UserProfileService : IUserProfileService
{
    private readonly IUserProfileRepository _profileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UserProfileService(IUserProfileRepository profileRepository, IUnitOfWork unitOfWork)
    {
        _profileRepository = profileRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserProfileDto?> GetByExternalUserIdAsync(string externalUserId, CancellationToken cancellationToken = default)
    {
        var profile = await _profileRepository.GetByExternalUserIdAsync(externalUserId, cancellationToken);
        return profile is null ? null : ProfileMapper.ToDto(profile);
    }

    public async Task<UserProfileDto?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var profile = await _profileRepository.GetByUserIdAsync(userId, cancellationToken);
        return profile is null ? null : ProfileMapper.ToDto(profile);
    }

    public async Task<UserProfileDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var profile = await _profileRepository.GetByIdWithDetailsAsync(id, cancellationToken);
        return profile is null ? null : ProfileMapper.ToDto(profile);
    }

    public async Task<UserProfileDto> CreateAsync(CreateUserProfileDto dto, CancellationToken cancellationToken = default)
    {
        var existing = dto.ExternalUserId is not null
            ? await _profileRepository.GetByExternalUserIdAsync(dto.ExternalUserId, cancellationToken)
            : null;
        if (existing is not null)
            throw new InvalidOperationException("Profile already exists for this user.");

        var profile = new UserProfile
        {
            ExternalUserId = dto.ExternalUserId,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Bio = dto.Bio,
            ResumeUrl = dto.ResumeUrl,
            Location = dto.Location,
        };

        ApplyCollections(profile, dto.Educations, dto.Skills, dto.Experiences);
        ProfileCompletenessChecker.UpdateFlag(profile, dto.Educations?.Count, dto.Skills?.Count, dto.Experiences?.Count);

        await _profileRepository.AddAsync(profile, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await _profileRepository.GetByIdWithDetailsAsync(profile.Id, cancellationToken);
        return ProfileMapper.ToDto(created!);
    }

    public async Task<UserProfileDto?> UpdateForCurrentUserAsync(
        Guid userId,
        UpdateUserProfileDto dto,
        CancellationToken cancellationToken = default)
    {
        var profile = await _profileRepository.GetByUserIdForUpdateAsync(userId, cancellationToken);
        if (profile is null) return null;

        return await ApplyUpdateAsync(profile, dto, cancellationToken);
    }

    public async Task<UserProfileDto?> UpdateAsync(Guid id, UpdateUserProfileDto dto, CancellationToken cancellationToken = default)
    {
        var profile = await _profileRepository.GetByIdForUpdateAsync(id, cancellationToken);
        if (profile is null) return null;

        return await ApplyUpdateAsync(profile, dto, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var profile = await _profileRepository.GetByIdAsync(id, cancellationToken);
        if (profile is null) return false;

        await _profileRepository.DeleteAsync(profile, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<ProfileCompletenessDto> CheckCompletenessAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var profile = await _profileRepository.GetByIdWithDetailsAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException("Profile not found.");
        return ProfileCompletenessChecker.Check(profile);
    }

    private async Task<UserProfileDto> ApplyUpdateAsync(
        UserProfile profile,
        UpdateUserProfileDto dto,
        CancellationToken cancellationToken)
    {
        profile.FirstName = dto.FirstName;
        profile.LastName = dto.LastName;
        profile.Email = dto.Email;
        profile.Phone = dto.Phone;
        profile.Bio = dto.Bio;
        profile.ResumeUrl = dto.ResumeUrl;
        profile.Location = dto.Location;

        if (dto.Educations is not null)
        {
            await _profileRepository.ReplaceEducationsAsync(
                profile.Id,
                BuildEducations(dto.Educations, profile.Id),
                cancellationToken);
        }

        if (dto.Skills is not null)
        {
            await _profileRepository.ReplaceSkillsAsync(
                profile.Id,
                BuildSkills(dto.Skills, profile.Id),
                cancellationToken);
        }

        if (dto.Experiences is not null)
        {
            await _profileRepository.ReplaceExperiencesAsync(
                profile.Id,
                BuildExperiences(dto.Experiences, profile.Id),
                cancellationToken);
        }

        ProfileCompletenessChecker.UpdateFlag(
            profile,
            dto.Educations?.Count,
            dto.Skills?.Count,
            dto.Experiences?.Count);

        _unitOfWork.LogPendingChanges($"profile-update profileId={profile.Id} userId={profile.UserId}");

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await _profileRepository.GetByIdWithDetailsAsync(profile.Id, cancellationToken);
        return ProfileMapper.ToDto(updated!);
    }

    private static List<Education> BuildEducations(IReadOnlyList<CreateEducationDto> educations, Guid profileId)
        => educations.Select(e => new Education
        {
            UserProfileId = profileId,
            Institution = e.Institution,
            Degree = e.Degree,
            FieldOfStudy = e.FieldOfStudy,
            StartDate = e.StartDate,
            EndDate = e.EndDate,
            IsCurrent = e.IsCurrent,
        }).ToList();

    private static List<Skill> BuildSkills(IReadOnlyList<CreateSkillDto> skills, Guid profileId)
        => skills.Select(s => new Skill
        {
            UserProfileId = profileId,
            Name = s.Name,
            Level = s.Level,
        }).ToList();

    private static List<Experience> BuildExperiences(IReadOnlyList<CreateExperienceDto> experiences, Guid profileId)
        => experiences.Select(e => new Experience
        {
            UserProfileId = profileId,
            Company = e.Company,
            Title = e.Title,
            Description = e.Description,
            StartDate = e.StartDate,
            EndDate = e.EndDate,
            IsCurrent = e.IsCurrent,
        }).ToList();

    private static void ApplyCollections(
        UserProfile profile,
        IReadOnlyList<CreateEducationDto>? educations,
        IReadOnlyList<CreateSkillDto>? skills,
        IReadOnlyList<CreateExperienceDto>? experiences)
    {
        if (educations is not null)
        {
            foreach (var e in educations)
            {
                profile.Educations.Add(new Education
                {
                    UserProfileId = profile.Id,
                    Institution = e.Institution,
                    Degree = e.Degree,
                    FieldOfStudy = e.FieldOfStudy,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    IsCurrent = e.IsCurrent,
                });
            }
        }

        if (skills is not null)
        {
            foreach (var s in skills)
            {
                profile.Skills.Add(new Skill
                {
                    UserProfileId = profile.Id,
                    Name = s.Name,
                    Level = s.Level,
                });
            }
        }

        if (experiences is not null)
        {
            foreach (var e in experiences)
            {
                profile.Experiences.Add(new Experience
                {
                    UserProfileId = profile.Id,
                    Company = e.Company,
                    Title = e.Title,
                    Description = e.Description,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    IsCurrent = e.IsCurrent,
                });
            }
        }
    }
}
