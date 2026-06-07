namespace SwipeJobs.Application.Modules.Auth.Interfaces;

using SwipeJobs.Application.Common.Dtos;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RefreshAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken cancellationToken = default);
}

public interface ITokenService
{
    string GenerateAccessToken(Guid userId, Guid? profileId, string email, string role, Guid? companyId);
    string GenerateRefreshToken();
    string HashToken(string token);
    int GetAccessTokenExpirySeconds();
}
