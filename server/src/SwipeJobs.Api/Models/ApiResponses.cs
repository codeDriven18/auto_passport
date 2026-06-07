namespace SwipeJobs.Api.Models;

public record ApiErrorResponse(string Error, string? Code = null);

public record ApiSuccessResponse<T>(T Data);

public record HealthResponse(
    string Status,
    string Service,
    string Version,
    string Database,
    DateTime CheckedAt);
