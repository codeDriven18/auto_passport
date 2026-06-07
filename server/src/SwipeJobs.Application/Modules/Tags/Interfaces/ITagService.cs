using SwipeJobs.Application.Common.Dtos;

namespace SwipeJobs.Application.Modules.Tags.Interfaces;

public interface ITagService
{
    Task<IReadOnlyList<TagDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TagDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TagDto> CreateAsync(CreateTagDto dto, CancellationToken cancellationToken = default);
    Task<TagDto?> UpdateAsync(Guid id, UpdateTagDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
