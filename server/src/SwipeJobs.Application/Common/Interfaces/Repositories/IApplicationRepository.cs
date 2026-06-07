using ApplicationEntity = SwipeJobs.Domain.Entities.Application;

namespace SwipeJobs.Application.Common.Interfaces.Repositories;

public interface IApplicationRepository : IRepository<ApplicationEntity>
{
    Task<IReadOnlyList<ApplicationEntity>> GetByUserProfileIdAsync(Guid userProfileId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ApplicationEntity>> GetByCompanyIdAsync(Guid companyId, Guid? jobId, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ApplicationEntity>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default);
}
