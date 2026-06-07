using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Common.Interfaces.Repositories;

public interface ITagRepository : IRepository<Tag>
{
    Task<Tag?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
}
