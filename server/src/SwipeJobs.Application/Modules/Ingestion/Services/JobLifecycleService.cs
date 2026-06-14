using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Application.Modules.Ingestion.Services;

public interface IJobLifecycleService
{
    Task<bool> SetLifecycleStatusAsync(Guid jobId, JobLifecycleStatus status, CancellationToken cancellationToken = default);
    Task<int> ExpireDueJobsAsync(CancellationToken cancellationToken = default);
}

public class JobLifecycleService : IJobLifecycleService
{
    private readonly IJobRepository _jobRepository;
    private readonly IUnitOfWork _unitOfWork;

    public JobLifecycleService(IJobRepository jobRepository, IUnitOfWork unitOfWork)
    {
        _jobRepository = jobRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> SetLifecycleStatusAsync(
        Guid jobId,
        JobLifecycleStatus status,
        CancellationToken cancellationToken = default)
    {
        var job = await _jobRepository.GetByIdAsync(jobId, cancellationToken);
        if (job is null) return false;

        job.LifecycleStatus = status;
        job.IsActive = status == JobLifecycleStatus.Published;
        job.IsArchived = status is JobLifecycleStatus.Archived or JobLifecycleStatus.Rejected;

        if (status == JobLifecycleStatus.Paused)
            job.IsActive = false;

        await _jobRepository.UpdateAsync(job, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<int> ExpireDueJobsAsync(CancellationToken cancellationToken = default)
    {
        var jobs = await _jobRepository.GetAllWithDetailsAsync(cancellationToken);
        var now = DateTime.UtcNow;
        var count = 0;

        foreach (var job in jobs.Where(j =>
            j.LifecycleStatus == JobLifecycleStatus.Published &&
            j.ExpiresAt.HasValue &&
            j.ExpiresAt.Value <= now))
        {
            job.LifecycleStatus = JobLifecycleStatus.Expired;
            job.IsActive = false;
            await _jobRepository.UpdateAsync(job, cancellationToken);
            count++;
        }

        if (count > 0)
            await _unitOfWork.SaveChangesAsync(cancellationToken);

        return count;
    }
}
