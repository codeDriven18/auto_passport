using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common;

public static class SourceTrustHelper
{
    public static SourceTrustLevel ToLevel(int trustScore) => trustScore switch
    {
        >= 90 => SourceTrustLevel.Trusted,
        >= 75 => SourceTrustLevel.Verified,
        >= 50 => SourceTrustLevel.Standard,
        >= 25 => SourceTrustLevel.Community,
        _ => SourceTrustLevel.Unknown,
    };
}
