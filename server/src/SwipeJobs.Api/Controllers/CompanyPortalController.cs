using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Modules.Portal.Interfaces;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/portal")]
[Authorize]
public class CompanyPortalController : ControllerBase
{
    private readonly ICompanyPortalService _portalService;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<CompanyPortalController> _logger;

    public CompanyPortalController(
        ICompanyPortalService portalService,
        ICurrentUserService currentUser,
        ILogger<CompanyPortalController> logger)
    {
        _portalService = portalService;
        _currentUser = currentUser;
        _logger = logger;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> Stats(CancellationToken cancellationToken)
    {
        _currentUser.RequireRole(UserRole.Company, UserRole.Admin);
        var companyId = _currentUser.GetRequiredCompanyId();
        return Ok(await _portalService.GetStatsAsync(companyId, cancellationToken));
    }

    [HttpGet("jobs")]
    public async Task<IActionResult> Jobs(CancellationToken cancellationToken)
    {
        _currentUser.RequireRole(UserRole.Company, UserRole.Admin);
        var companyId = _currentUser.GetRequiredCompanyId();
        return Ok(await _portalService.GetJobsAsync(companyId, cancellationToken));
    }

    [HttpPost("jobs")]
    public async Task<IActionResult> CreateJob([FromBody] PortalCreateJobDto dto, CancellationToken cancellationToken)
    {
        _currentUser.RequireRole(UserRole.Company, UserRole.Admin);
        var companyId = _currentUser.GetRequiredCompanyId();

        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    e => e.Key,
                    e => e.Value!.Errors.Select(x => x.ErrorMessage).ToArray());
            _logger.LogWarning(
                "POST /api/portal/jobs model binding failed companyId={CompanyId} errors={Errors}",
                companyId,
                errors);
            return ValidationProblem(ModelState);
        }

        _logger.LogInformation(
            "POST /api/portal/jobs companyId={CompanyId} title={Title} category={Category} level={Level} isRemote={IsRemote} hasSalary={HasSalary}",
            companyId,
            dto.Title,
            dto.Category,
            dto.Level,
            dto.IsRemote,
            dto.SalaryMin.HasValue || dto.SalaryMax.HasValue);

        try
        {
            var job = await _portalService.CreateJobAsync(companyId, dto, cancellationToken);
            return Ok(job);
        }
        catch (InvalidOperationException ex)
        {
            var code = ex.Message.Contains("approved", StringComparison.OrdinalIgnoreCase)
                ? "company_not_approved"
                : ex.Message.Contains("source", StringComparison.OrdinalIgnoreCase)
                    ? "no_job_source"
                    : "job_create_rejected";

            _logger.LogWarning(
                ex,
                "POST /api/portal/jobs rejected companyId={CompanyId} code={Code}",
                companyId,
                code);

            return BadRequest(new { error = ex.Message, code });
        }
    }

    [HttpPut("jobs/{id:guid}")]
    public async Task<IActionResult> UpdateJob(Guid id, [FromBody] PortalUpdateJobDto dto, CancellationToken cancellationToken)
    {
        _currentUser.RequireRole(UserRole.Company, UserRole.Admin);
        var companyId = _currentUser.GetRequiredCompanyId();
        var job = await _portalService.UpdateJobAsync(companyId, id, dto, cancellationToken);
        return job is null ? NotFound() : Ok(job);
    }

    [HttpPost("jobs/{id:guid}/archive")]
    public async Task<IActionResult> ArchiveJob(Guid id, CancellationToken cancellationToken)
    {
        _currentUser.RequireRole(UserRole.Company, UserRole.Admin);
        var companyId = _currentUser.GetRequiredCompanyId();
        var ok = await _portalService.ArchiveJobAsync(companyId, id, cancellationToken);
        return ok ? NoContent() : NotFound();
    }

    [HttpGet("applications")]
    public async Task<IActionResult> Applications([FromQuery] Guid? jobId, CancellationToken cancellationToken)
    {
        _currentUser.RequireRole(UserRole.Company, UserRole.Admin);
        var companyId = _currentUser.GetRequiredCompanyId();
        return Ok(await _portalService.GetApplicationsAsync(companyId, jobId, cancellationToken));
    }

    [HttpGet("applications/{id:guid}")]
    public async Task<IActionResult> GetApplicant(Guid id, CancellationToken cancellationToken)
    {
        _currentUser.RequireRole(UserRole.Company, UserRole.Admin);
        var companyId = _currentUser.GetRequiredCompanyId();
        var detail = await _portalService.GetApplicantDetailAsync(companyId, id, cancellationToken);
        return detail is null ? NotFound() : Ok(detail);
    }

    [HttpPatch("applications/{id:guid}/status")]
    public async Task<IActionResult> UpdateApplicationStatus(
        Guid id,
        [FromBody] PortalUpdateApplicationStatusDto dto,
        CancellationToken cancellationToken)
    {
        _currentUser.RequireRole(UserRole.Company, UserRole.Admin);
        var companyId = _currentUser.GetRequiredCompanyId();

        try
        {
            var updated = await _portalService.UpdateApplicationStatusAsync(companyId, id, dto.Status, cancellationToken);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message, code = "invalid_status" });
        }
    }

    [HttpGet("applications/{id:guid}/resume")]
    public async Task<IActionResult> DownloadApplicantResume(Guid id, CancellationToken cancellationToken)
    {
        _currentUser.RequireRole(UserRole.Company, UserRole.Admin);
        var companyId = _currentUser.GetRequiredCompanyId();
        var opened = await _portalService.OpenApplicantResumeAsync(companyId, id, cancellationToken);
        if (opened is null)
            return NotFound(new { error = "Resume not available." });

        var (stream, contentType, fileName) = opened.Value;
        return File(stream, contentType, fileName);
    }

    [HttpGet("company")]
    public async Task<IActionResult> Company(CancellationToken cancellationToken)
    {
        _currentUser.RequireRole(UserRole.Company, UserRole.Admin);
        var companyId = _currentUser.GetRequiredCompanyId();
        var company = await _portalService.GetCompanyAsync(companyId, cancellationToken);
        return company is null ? NotFound() : Ok(company);
    }

    [HttpPut("company")]
    public async Task<IActionResult> UpdateCompany([FromBody] PortalUpdateCompanyDto dto, CancellationToken cancellationToken)
    {
        _currentUser.RequireRole(UserRole.Company, UserRole.Admin);
        var companyId = _currentUser.GetRequiredCompanyId();
        var company = await _portalService.UpdateCompanyAsync(companyId, dto, cancellationToken);
        return company is null ? NotFound() : Ok(company);
    }
}
