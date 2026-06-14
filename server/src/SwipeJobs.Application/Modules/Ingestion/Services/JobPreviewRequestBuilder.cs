using System.Text.Json;
using SwipeJobs.Application.Modules.Ingestion.Models;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

internal static class JobPreviewRequestBuilder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };

    public static string BuildUserMessage(
        JobExtractionResult extraction,
        string? channelHint,
        int extractionConfidence)
    {
        var payload = new
        {
            extractionConfidence,
            channelHint,
            title = extraction.Title,
            company = extraction.CompanyName,
            description = extraction.Description,
            location = extraction.Location,
            city = extraction.City,
            remote = extraction.IsRemote,
            salaryMin = extraction.SalaryMin,
            salaryMax = extraction.SalaryMax,
            employmentType = extraction.EmploymentType,
            skills = extraction.Skills,
        };

        return JsonSerializer.Serialize(payload, JsonOptions);
    }
}
