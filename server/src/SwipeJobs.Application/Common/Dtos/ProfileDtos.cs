namespace SwipeJobs.Application.Common.Dtos;

public record EducationDto(
    Guid Id,
    string Institution,
    string Degree,
    string? FieldOfStudy,
    DateTime? StartDate,
    DateTime? EndDate,
    bool IsCurrent);

public record CreateEducationDto(
    string Institution,
    string Degree,
    string? FieldOfStudy,
    DateTime? StartDate,
    DateTime? EndDate,
    bool IsCurrent);

public record SkillDto(Guid Id, string Name, string? Level);

public record CreateSkillDto(string Name, string? Level);

public record ExperienceDto(
    Guid Id,
    string Company,
    string Title,
    string? Description,
    DateTime? StartDate,
    DateTime? EndDate,
    bool IsCurrent);

public record CreateExperienceDto(
    string Company,
    string Title,
    string? Description,
    DateTime? StartDate,
    DateTime? EndDate,
    bool IsCurrent);

public record UserProfileDto(
    Guid Id,
    string? ExternalUserId,
    Guid? UserId,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? Bio,
    string? ResumeUrl,
    string? Location,
    bool IsProfileComplete,
    IReadOnlyList<EducationDto> Educations,
    IReadOnlyList<SkillDto> Skills,
    IReadOnlyList<ExperienceDto> Experiences,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record CreateUserProfileDto(
    string? ExternalUserId,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? Bio,
    string? ResumeUrl,
    string? Location,
    IReadOnlyList<CreateEducationDto>? Educations,
    IReadOnlyList<CreateSkillDto>? Skills,
    IReadOnlyList<CreateExperienceDto>? Experiences);

public record UpdateUserProfileDto(
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? Bio,
    string? ResumeUrl,
    string? Location,
    IReadOnlyList<CreateEducationDto>? Educations,
    IReadOnlyList<CreateSkillDto>? Skills,
    IReadOnlyList<CreateExperienceDto>? Experiences);

public record ProfileCompletenessDto(bool IsComplete, IReadOnlyList<string> MissingFields, int CompletionPercentage);
