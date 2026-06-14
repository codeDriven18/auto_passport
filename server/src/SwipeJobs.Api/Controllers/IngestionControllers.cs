using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Modules.Ingestion.Services;
using SwipeJobs.Domain.Entities;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/jobs")]
public class JobReportsController : ControllerBase
{
    private readonly IJobReportRepository _reportRepository;
    private readonly IJobRepository _jobRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public JobReportsController(
        IJobReportRepository reportRepository,
        IJobRepository jobRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _reportRepository = reportRepository;
        _jobRepository = jobRepository;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    [HttpPost("{id:guid}/report")]
    [Authorize]
    public async Task<IActionResult> Report(Guid id, [FromBody] CreateJobReportDto dto, CancellationToken cancellationToken = default)
    {
        var job = await _jobRepository.GetByIdAsync(id, cancellationToken);
        if (job is null) return NotFound();

        var report = new JobReport
        {
            JobId = id,
            UserId = _currentUser.GetRequiredUserId(),
            Reason = dto.Reason,
            Details = dto.Details,
            Status = JobReportStatus.Pending,
        };

        await _reportRepository.AddAsync(report, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Ok(new { id = report.Id });
    }
}

[ApiController]
[Route("api/ingestion/telegram")]
public class TelegramIngestionController : ControllerBase
{
    private readonly IngestionPipelineService _pipeline;
    private readonly IConfiguration _configuration;

    public TelegramIngestionController(IngestionPipelineService pipeline, IConfiguration configuration)
    {
        _pipeline = pipeline;
        _configuration = configuration;
    }

    /// <summary>Webhook for Telegram bot / channel forwarder. Requires X-Ingestion-Secret header when configured.</summary>
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook(
        [FromBody] TelegramIngestMessageDto dto,
        [FromHeader(Name = "X-Ingestion-Secret")] string? secret,
        CancellationToken cancellationToken = default)
    {
        var expected = _configuration["Ingestion:WebhookSecret"];
        if (!string.IsNullOrWhiteSpace(expected) && secret != expected)
            return Unauthorized();

        var (candidate, isDuplicate) = await _pipeline.ProcessTelegramMessageAsync(dto, cancellationToken);
        return Ok(new { candidateId = candidate.Id, isDuplicate });
    }
}
