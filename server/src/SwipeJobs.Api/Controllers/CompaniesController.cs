using Microsoft.AspNetCore.Mvc;
using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Modules.Companies.Interfaces;

namespace SwipeJobs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyService _companyService;

    public CompaniesController(ICompanyService companyService)
    {
        _companyService = companyService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var companies = await _companyService.GetAllAsync(cancellationToken);
        return Ok(companies);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var company = await _companyService.GetBySlugAsync(slug, cancellationToken);
        return company is null ? NotFound() : Ok(company);
    }

}
