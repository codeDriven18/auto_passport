namespace SwipeJobs.Application.Common.Auth;

public static class AuthSessionOptions
{
    public const int AccessTokenMinutes = 15;
    public const int UserRefreshTokenDays = 30;
    public const int RememberMeRefreshTokenDays = 90;
    public const int AdminRefreshTokenDays = 7;
}
