namespace SwipeJobs.Application.Modules.Ingestion.Models;

public record JobPreviewResult(
    string DisplayTitle,
    string DisplayCompany,
    string DisplaySalary,
    string DisplayLocation,
    IReadOnlyList<string> DisplaySkills,
    string DisplaySummary);

public record JobPreviewGenerationResponse(
    JobPreviewResult? Result,
    bool Success,
    string? ErrorMessage,
    long ProcessingTimeMs,
    int? HttpStatusCode = null);
