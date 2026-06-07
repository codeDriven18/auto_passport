using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Common.Interfaces.Repositories;

public interface ICompanyFollowRepository : IRepository<CompanyFollow>
{
    Task<IReadOnlyList<CompanyFollow>> GetByUserProfileIdAsync(Guid userProfileId, CancellationToken cancellationToken = default);
    Task<CompanyFollow?> GetByUserAndCompanyAsync(Guid userProfileId, Guid companyId, CancellationToken cancellationToken = default);
    Task<bool> IsFollowingAsync(Guid userProfileId, Guid companyId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Guid>> GetFollowedCompanyIdsAsync(Guid userProfileId, CancellationToken cancellationToken = default);
}
