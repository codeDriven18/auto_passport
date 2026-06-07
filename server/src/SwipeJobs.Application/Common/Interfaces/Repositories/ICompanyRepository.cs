using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Common.Interfaces.Repositories;

public interface ICompanyRepository : IRepository<Company>
{
    Task<Company?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Company>> GetAllActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Company>> GetByStatusAsync(CompanyStatus status, CancellationToken cancellationToken = default);
    Task<int> CountOpenJobsAsync(Guid companyId, CancellationToken cancellationToken = default);
}
