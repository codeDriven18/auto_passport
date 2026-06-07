using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Common.Mapping;
using SwipeJobs.Application.Common.Models;
using SwipeJobs.Application.Modules.Jobs.Interfaces;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Modules.Jobs.Services;

public class JobService : IJobService
{
    private readonly IJobRepository _jobRepository;
    private readonly IUnitOfWork _unitOfWork;

    public JobService(IJobRepository jobRepository, IUnitOfWork unitOfWork)
    {
        _jobRepository = jobRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<JobDto>> SearchAsync(JobQueryDto query, CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _jobRepository.SearchAsync(query, cancellationToken);
        return new PagedResult<JobDto>
        {
            Items = items.Select(JobMapper.ToDto).ToList(),
            TotalCount = totalCount,
            Page = Math.Max(1, query.Page),
            PageSize = Math.Clamp(query.PageSize, 1, 50),
        };
    }

    public async Task<JobDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var job = await _jobRepository.GetByIdWithDetailsAsync(id, cancellationToken);
        return job is null ? null : JobMapper.ToDto(job);
    }

    public async Task<JobDto> CreateAsync(CreateJobDto dto, CancellationToken cancellationToken = default)
    {
        var job = new Job();
        JobMapper.ApplyCreate(job, dto);
        await _jobRepository.AddAsync(job, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (dto.TagIds is { Count: > 0 })
        {
            await _jobRepository.SetTagsAsync(job.Id, dto.TagIds, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return (await GetByIdAsync(job.Id, cancellationToken))!;
    }

    public async Task<JobDto?> UpdateAsync(Guid id, UpdateJobDto dto, CancellationToken cancellationToken = default)
    {
        var job = await _jobRepository.GetByIdAsync(id, cancellationToken);
        if (job is null) return null;

        JobMapper.ApplyUpdate(job, dto);
        await _jobRepository.UpdateAsync(job, cancellationToken);

        if (dto.TagIds is not null)
        {
            await _jobRepository.SetTagsAsync(job.Id, dto.TagIds, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var job = await _jobRepository.GetByIdAsync(id, cancellationToken);
        if (job is null) return false;

        job.IsActive = false;
        await _jobRepository.UpdateAsync(job, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
