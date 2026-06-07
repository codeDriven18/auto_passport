using SwipeJobs.Application.Common.Dtos;

namespace SwipeJobs.Application.Modules.Companies.Interfaces;

public interface ICompanyService
{
    Task<IReadOnlyList<CompanyDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<CompanyDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<CompanyDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CompanyDto> CreateAsync(CreateCompanyDto dto, CancellationToken cancellationToken = default);
    Task<CompanyDto?> UpdateAsync(Guid id, UpdateCompanyDto dto, CancellationToken cancellationToken = default);
}
