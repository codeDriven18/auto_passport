using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Common.Interfaces.Repositories;

public interface IJobRepository : IRepository<Job>
{
    Task<IReadOnlyList<Job>> GetActiveJobsAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Job> Items, int TotalCount)> SearchAsync(
        JobQueryDto query,
        CancellationToken cancellationToken = default);
    Task<Job?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Job>> GetByIdsWithDetailsAsync(IReadOnlyList<Guid> ids, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Job>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Job>> GetByCompanyIdAsync(Guid companyId, CancellationToken cancellationToken = default);
    Task SetTagsAsync(Guid jobId, IReadOnlyList<Guid> tagIds, CancellationToken cancellationToken = default);
}
