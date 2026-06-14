using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common.Dtos;

public record RegisterDto(
    string Email,
    string Password,
    string? FirstName,
    string? LastName,
    string? AccountType,
    string? CompanyName);

public record LoginDto(string Email, string Password, bool RememberMe = false);

public record RefreshTokenDto(string RefreshToken);

public record LogoutDto(string RefreshToken);

public record ForgotPasswordDto(string Email);

public record AuthUserDto(
    Guid Id,
    string Email,
    Guid? ProfileId,
    UserRole Role,
    Guid? CompanyId,
    string? CompanyName,
    CompanyStatus? CompanyStatus);

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    int ExpiresInSeconds,
    Guid SessionId,
    AuthUserDto User);

public record UserSessionDto(
    Guid Id,
    string DeviceInfo,
    string? IpAddress,
    DateTime CreatedAt,
    DateTime LastActivityAt,
    DateTime ExpiresAt,
    bool IsRememberMe,
    bool IsCurrent);

public record ChangePasswordDto(string CurrentPassword, string NewPassword);
