namespace SwipeJobs.Application.Modules.Ingestion;

public class ModerationException : Exception
{
    public ModerationException(
        string code,
        string message,
        string? details = null,
        Exception? inner = null)
        : base(message, inner)
    {
        Code = code;
        Details = details;
    }

    public string Code { get; }
    public string? Details { get; }
}

public static class ModerationErrorCodes
{
    public const string CandidateNotFound = "candidate_not_found";
    public const string CandidateNotApprovable = "candidate_not_approvable";
    public const string ApproveMissingTitle = "approve_missing_title";
    public const string ApproveMissingCompany = "approve_missing_company";
    public const string PublishFailed = "publish_failed";
    public const string SourceNotFound = "source_not_found";
}

