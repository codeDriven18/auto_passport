namespace SwipeJobs.Application.Modules.Ingestion;

public static class IngestionErrorSummarizer
{
    public static string ForDisplay(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return "Ingestion failed.";

        var lower = raw.ToLowerInvariant();
        if (lower.Contains("not found") && lower.Contains("model"))
            return "Gemini model not found.";
        if (lower.Contains("apikey") || lower.Contains("api key"))
            return "Gemini API key missing.";
        if (lower.Contains("gemini api error 401") || lower.Contains("unauthorized"))
            return "Gemini authentication failed.";
        if (lower.Contains("gemini"))
            return "Gemini extraction failed.";
        if (lower.Contains("invalid ai response"))
            return "Invalid AI response.";
        if (lower.Contains("persistence"))
            return "Candidate persistence failed.";

        var firstLine = raw.Split('\n', '\r')[0].Trim();
        return firstLine.Length <= 120 ? firstLine : firstLine[..117] + "...";
    }
}
