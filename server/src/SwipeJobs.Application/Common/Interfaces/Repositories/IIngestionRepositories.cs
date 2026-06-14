using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common.Interfaces.Repositories;

public interface IIngestionMessageRepository : IRepository<IngestionMessage>
{
    Task<IngestionMessage?> GetByExternalKeyAsync(Guid sourceId, string externalSourceKey, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
}

public interface IJobCandidateRepository : IRepository<JobCandidate>
{
    Task<JobCandidate?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<JobCandidate?> FindByContentFingerprintAsync(string fingerprint, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<JobCandidate>> GetModerationQueueAsync(CandidateJobStatus? status, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountByStatusAsync(CandidateJobStatus status, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<JobCandidate>> GetByDuplicateGroupIdAsync(Guid groupId, CancellationToken cancellationToken = default);
}

public interface IJobReportRepository : IRepository<JobReport>
{
    Task<IReadOnlyList<JobReport>> GetPendingAsync(CancellationToken cancellationToken = default);
}
