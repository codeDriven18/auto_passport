namespace SwipeJobs.Application.Common.Auth;

public sealed record AuthClientInfo(
    string? IpAddress,
    string? DeviceInfo,
    bool RememberMe = false);
