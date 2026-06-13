using System.Net;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Modules.Jobs.Interfaces;

namespace SwipeJobs.Api.Controllers;

[AllowAnonymous]
[ApiController]
[Route("share")]
public class SharePreviewController : ControllerBase
{
    private readonly IJobService _jobService;
    private readonly IUserProfileRepository _profileRepository;
    private readonly IConfiguration _configuration;

    public SharePreviewController(
        IJobService jobService,
        IUserProfileRepository profileRepository,
        IConfiguration configuration)
    {
        _jobService = jobService;
        _profileRepository = profileRepository;
        _configuration = configuration;
    }

    [HttpGet("jobs/{id:guid}")]
    [Produces("text/html")]
    public async Task<IActionResult> JobPreview(Guid id, CancellationToken cancellationToken)
    {
        var job = await _jobService.GetByIdAsync(id, cancellationToken);
        if (job is null) return NotFound();

        var appUrl = ResolveAppUrl();
        var targetUrl = $"{appUrl}/jobs/{id}";
        var title = $"{job.Title} at {job.Company}";
        var salary = FormatSalary(job.SalaryMin, job.SalaryMax);
        var description = string.Join(" · ", new[] { salary, job.City ?? job.Location, job.SourceName }
            .Where(s => !string.IsNullOrWhiteSpace(s)));
        var image = ResolveImageUrl(job.JobImageUrl ?? job.AiGeneratedImageUrl ?? job.CompanyLogoUrl, appUrl);

        return Content(BuildHtml(title, description, image, targetUrl), "text/html", Encoding.UTF8);
    }

    [HttpGet("profile/{id:guid}")]
    [Produces("text/html")]
    public async Task<IActionResult> ProfilePreview(Guid id, CancellationToken cancellationToken)
    {
        var profile = await _profileRepository.GetByIdAsync(id, cancellationToken);
        if (profile is null) return NotFound();

        var appUrl = ResolveAppUrl();
        var targetUrl = $"{appUrl}/p/{id}";
        var name = $"{profile.FirstName} {profile.LastName}".Trim();
        var title = string.IsNullOrWhiteSpace(name) ? "SwipeJobs Profile" : $"{name} on SwipeJobs";
        var description = profile.Headline?.Trim()
            ?? profile.Location?.Trim()
            ?? "Candidate profile on SwipeJobs";
        var image = ResolveImageUrl(profile.ProfileImageUrl, appUrl);

        return Content(BuildHtml(title, description, image, targetUrl), "text/html", Encoding.UTF8);
    }

    private string ResolveAppUrl()
    {
        var configured = _configuration["App:PublicUrl"]?.Trim().TrimEnd('/');
        if (!string.IsNullOrWhiteSpace(configured)) return configured;
        return "https://swipejobs-khaki.vercel.app";
    }

    private static string? ResolveImageUrl(string? url, string appUrl)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;
        var trimmed = url.Trim();
        if (trimmed.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
            || trimmed.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            return trimmed;
        if (trimmed.StartsWith('/')) return $"{appUrl}{trimmed}";
        return trimmed;
    }

    private static string FormatSalary(decimal? min, decimal? max)
    {
        if (min is null && max is null) return string.Empty;
        if (min is not null && max is not null) return $"${min:N0} – ${max:N0}";
        if (min is not null) return $"From ${min:N0}";
        return $"Up to ${max:N0}";
    }

    private static string BuildHtml(string title, string description, string? image, string targetUrl)
    {
        var safeTitle = WebUtility.HtmlEncode(title);
        var safeDescription = WebUtility.HtmlEncode(description);
        var safeUrl = WebUtility.HtmlEncode(targetUrl);
        var imageTags = string.IsNullOrWhiteSpace(image)
            ? string.Empty
            : $"""
               <meta property="og:image" content="{WebUtility.HtmlEncode(image)}" />
               <meta name="twitter:card" content="summary_large_image" />
               <meta name="twitter:image" content="{WebUtility.HtmlEncode(image)}" />
               """;

        return $$"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8" />
              <title>{{safeTitle}}</title>
              <meta name="description" content="{{safeDescription}}" />
              <meta property="og:title" content="{{safeTitle}}" />
              <meta property="og:description" content="{{safeDescription}}" />
              <meta property="og:url" content="{{safeUrl}}" />
              <meta property="og:type" content="website" />
              {{imageTags}}
              <meta http-equiv="refresh" content="0;url={{safeUrl}}" />
            </head>
            <body>
              <p><a href="{{safeUrl}}">Continue to SwipeJobs</a></p>
            </body>
            </html>
            """;
    }
}
