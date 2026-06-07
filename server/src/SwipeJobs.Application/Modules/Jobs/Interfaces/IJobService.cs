using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Models;

namespace SwipeJobs.Application.Modules.Jobs.Interfaces;

public interface IJobService
{
    Task<PagedResult<JobDto>> SearchAsync(JobQueryDto query, CancellationToken cancellationToken = default);
    Task<JobDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<JobDto> CreateAsync(CreateJobDto dto, CancellationToken cancellationToken = default);
    Task<JobDto?> UpdateAsync(Guid id, UpdateJobDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
