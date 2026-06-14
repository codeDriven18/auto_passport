using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Modules.Ingestion.Interfaces;
using SwipeJobs.Domain.Enums;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/admin/ai")]
[Authorize]
public class AdminAiController : ControllerBase
{
    private readonly IAiExtractionService _extractionService;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<AdminAiController> _logger;

    public AdminAiController(
        IAiExtractionService extractionService,
        ICurrentUserService currentUser,
        ILogger<AdminAiController> logger)
    {
        _extractionService = extractionService;
        _currentUser = currentUser;
        _logger = logger;
    }

    [HttpPost("test-extraction")]
    public async Task<IActionResult> TestExtraction(
        [FromBody] TestExtractionRequest request,
        CancellationToken cancellationToken = default)
    {
        _currentUser.RequireRole(UserRole.Admin);

        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { error = "message is required." });

        _logger.LogInformation(
            "Admin AI test extraction requested. MessageLength={Length}",
            request.Message.Length);

        var result = await _extractionService.ExtractJobAsync(request.Message, cancellationToken);

        if (!result.Success)
        {
            _logger.LogWarning(
                "Admin AI test extraction failed. Provider={Provider}, Model={Model}, Error={Error}",
                result.Provider,
                result.Model,
                result.ErrorMessage);
            return StatusCode(StatusCodes.Status502BadGateway, result);
        }

        _logger.LogInformation(
            "Admin AI test extraction succeeded. Provider={Provider}, Model={Model}, Confidence={Confidence}, ProcessingTimeMs={ProcessingTimeMs}",
            result.Provider,
            result.Model,
            result.Result?.Confidence,
            result.ProcessingTimeMs);

        return Ok(result);
    }

    public sealed record TestExtractionRequest(string Message);
}
