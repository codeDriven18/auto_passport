namespace SwipeJobs.Application.Modules.Auth.Interfaces;

using SwipeJobs.Application.Common.Auth;
using SwipeJobs.Application.Common.Dtos;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto, AuthClientInfo client, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> LoginAsync(LoginDto dto, AuthClientInfo client, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RefreshAsync(string refreshToken, AuthClientInfo client, CancellationToken cancellationToken = default);
    Task LogoutAsync(string refreshToken, AuthClientInfo client, CancellationToken cancellationToken = default);
    Task LogoutAllAsync(Guid userId, AuthClientInfo client, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserSessionDto>> GetSessionsAsync(Guid userId, string? currentRefreshToken, CancellationToken cancellationToken = default);
    Task RevokeSessionAsync(Guid userId, Guid sessionId, AuthClientInfo client, CancellationToken cancellationToken = default);
    Task ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto, AuthClientInfo client, CancellationToken cancellationToken = default);
}

public interface ITokenService
{
    string GenerateAccessToken(Guid userId, Guid? profileId, string email, string role, Guid? companyId);
    string GenerateRefreshToken();
    string HashToken(string token);
    int GetAccessTokenExpirySeconds();
}
