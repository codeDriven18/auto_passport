using SwipeJobs.Application.Common.Dtos;

namespace SwipeJobs.Application.Modules.Sources.Interfaces;

public interface ISourceService
{
    Task<IReadOnlyList<SourceDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SourceDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SourceDto> CreateAsync(CreateSourceDto dto, CancellationToken cancellationToken = default);
    Task<SourceDto?> UpdateAsync(Guid id, UpdateSourceDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
