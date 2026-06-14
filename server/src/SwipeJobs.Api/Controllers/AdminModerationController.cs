using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Mapping;
using SwipeJobs.Application.Modules.Ingestion;
using SwipeJobs.Application.Modules.Ingestion.Services;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/admin/moderation")]
[Authorize]
public class AdminModerationController : ControllerBase
{
    private readonly IModerationService _moderation;
    private readonly IngestionPipelineService _pipeline;
    private readonly IJobLifecycleService _lifecycle;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<AdminModerationController> _logger;

    public AdminModerationController(
        IModerationService moderation,
        IngestionPipelineService pipeline,
        IJobLifecycleService lifecycle,
        ICurrentUserService currentUser,
        ILogger<AdminModerationController> logger)
    {
        _moderation = moderation;
        _pipeline = pipeline;
        _lifecycle = lifecycle;
        _currentUser = currentUser;
        _logger = logger;
    }

    [HttpGet("queue")]
    public async Task<IActionResult> GetQueue(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        _currentUser.RequireRole(UserRole.Admin);

        var statusFilter = CandidateJobStatus.PendingReview;
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (int.TryParse(status, out var numericStatus) && Enum.IsDefined(typeof(CandidateJobStatus), numericStatus))
            {
                statusFilter = (CandidateJobStatus)numericStatus;
            }
            else if (!Enum.TryParse<CandidateJobStatus>(status, ignoreCase: true, out statusFilter))
            {
                _logger.LogWarning("Invalid moderation queue status filter: {Status}", status);
                return BadRequest(new
                {
                    error = $"Invalid status filter '{status}'.",
                    code = "invalid_status_filter",
                    details = "Use PendingReview, Approved, Rejected, Published, Archived, or 0-4.",
                });
            }
        }

        var queue = await _moderation.GetQueueAsync(statusFilter, page, pageSize, cancellationToken);
        _logger.LogInformation(
            "Moderation queue requested. Status={Status}, Page={Page}, Returned={Returned}, Pending={Pending}",
            statusFilter,
            page,
            queue.Items.Count,
            queue.PendingCount);

        return Ok(queue);
    }

    [HttpGet("candidates/{id:guid}")]
    public async Task<IActionResult> GetCandidate(Guid id, CancellationToken cancellationToken = default)
    {
        _currentUser.RequireRole(UserRole.Admin);
        var candidate = await _moderation.GetCandidateAsync(id, cancellationToken);
        return candidate is null ? NotFound() : Ok(candidate);
    }

    [HttpPost("candidates/{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken cancellationToken = default)
    {
        _currentUser.RequireRole(UserRole.Admin);

        try
        {
            var job = await _moderation.ApproveAndPublishAsync(id, _currentUser.GetRequiredUserId(), cancellationToken);
            _logger.LogInformation("Moderation approve succeeded. CandidateId={CandidateId}, JobId={JobId}", id, job?.Id);
            return Ok(new
            {
                job,
                candidateId = id,
                success = true,
                message = "Candidate approved and published.",
            });
        }
        catch (ModerationException ex)
        {
            _logger.LogWarning(
                ex,
                "Moderation approve failed. CandidateId={CandidateId}, Code={Code}, Details={Details}",
                id,
                ex.Code,
                ex.Details);
            throw;
        }
    }

    [HttpPost("candidates/{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectJobCandidateDto dto, CancellationToken cancellationToken = default)
    {
        _currentUser.RequireRole(UserRole.Admin);
        var ok = await _moderation.RejectAsync(id, _currentUser.GetRequiredUserId(), dto, cancellationToken);
        return ok ? NoContent() : NotFound();
    }

    [HttpPut("candidates/{id:guid}")]
    public async Task<IActionResult> Edit(Guid id, [FromBody] EditJobCandidateDto dto, CancellationToken cancellationToken = default)
    {
        _currentUser.RequireRole(UserRole.Admin);
        var updated = await _moderation.EditAsync(id, dto, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPost("bulk/approve-high-confidence")]
    public async Task<IActionResult> BulkApproveHighConfidence(CancellationToken cancellationToken = default)
    {
        _currentUser.RequireRole(UserRole.Admin);

        var result = await _moderation.BulkApproveHighConfidenceAsync(_currentUser.GetRequiredUserId(), cancellationToken);
        _logger.LogInformation(
            "Bulk approve high-confidence completed. Approved={Approved}, Failed={Failed}",
            result.Approved,
            result.Failed);

        return Ok(new
        {
            approved = result.Approved,
            failed = result.Failed,
            results = result.Results,
        });
    }

    [HttpPost("bulk/reject")]
    public async Task<IActionResult> BulkReject([FromBody] BulkModerationDto dto, [FromQuery] string reason = "Bulk rejected", CancellationToken cancellationToken = default)
    {
        _currentUser.RequireRole(UserRole.Admin);
        var count = await _moderation.BulkRejectAsync(dto.CandidateIds, _currentUser.GetRequiredUserId(), reason, cancellationToken);
        return Ok(new { rejected = count });
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> Analytics(CancellationToken cancellationToken = default)
    {
        _currentUser.RequireRole(UserRole.Admin);
        return Ok(await _moderation.GetAnalyticsAsync(cancellationToken));
    }

    [HttpGet("pipeline-diagnostics")]
    public async Task<IActionResult> PipelineDiagnostics(CancellationToken cancellationToken = default)
    {
        _currentUser.RequireRole(UserRole.Admin);
        var diagnostics = HttpContext.RequestServices.GetRequiredService<IIngestionDiagnosticsService>();
        return Ok(await diagnostics.GetPipelineDiagnosticsAsync(cancellationToken));
    }

    [HttpPost("ingest/telegram")]
    public async Task<IActionResult> IngestTelegram([FromBody] TelegramIngestMessageDto dto, CancellationToken cancellationToken = default)
    {
        _currentUser.RequireRole(UserRole.Admin);
        try
        {
            var (candidate, isDuplicate) = await _pipeline.ProcessTelegramMessageAsync(dto, cancellationToken);
            return Ok(new
            {
                candidate = IngestionMapper.ToCandidateDto(candidate),
                isDuplicate,
            });
        }
        catch (IngestionPipelineException ex)
        {
            return UnprocessableEntity(new { error = ex.Message, code = ex.Code });
        }
    }

    [HttpPatch("jobs/{id:guid}/lifecycle")]
    public async Task<IActionResult> SetJobLifecycle(Guid id, [FromBody] UpdateJobLifecycleDto dto, CancellationToken cancellationToken = default)
    {
        _currentUser.RequireRole(UserRole.Admin);
        var ok = await _lifecycle.SetLifecycleStatusAsync(id, dto.Status, cancellationToken);
        return ok ? NoContent() : NotFound();
    }
}
