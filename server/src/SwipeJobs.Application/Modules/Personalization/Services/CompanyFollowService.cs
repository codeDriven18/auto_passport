using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Common.Mapping;
using SwipeJobs.Application.Modules.Personalization.Interfaces;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Modules.Personalization.Services;

public class CompanyFollowService : ICompanyFollowService
{
    private readonly ICompanyFollowRepository _followRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly IJobRepository _jobRepository;
    private readonly ITrendingService _trendingService;
    private readonly IUnitOfWork _unitOfWork;

    public CompanyFollowService(
        ICompanyFollowRepository followRepository,
        ICompanyRepository companyRepository,
        IJobRepository jobRepository,
        ITrendingService trendingService,
        IUnitOfWork unitOfWork)
    {
        _followRepository = followRepository;
        _companyRepository = companyRepository;
        _jobRepository = jobRepository;
        _trendingService = trendingService;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CompanyFollowDto>> GetByUserAsync(
        Guid userProfileId, CancellationToken cancellationToken = default)
    {
        var follows = await _followRepository.GetByUserProfileIdAsync(userProfileId, cancellationToken);
        return follows.Select(f => new CompanyFollowDto(
            f.Id, f.UserProfileId, f.CompanyId,
            f.Company?.Name ?? string.Empty,
            f.Company?.Slug ?? string.Empty,
            f.FollowedAt)).ToList();
    }

    public async Task<CompanyFollowDto> FollowAsync(
        CreateCompanyFollowDto dto, CancellationToken cancellationToken = default)
    {
        var existing = await _followRepository.GetByUserAndCompanyAsync(
            dto.UserProfileId, dto.CompanyId, cancellationToken);
        if (existing is not null)
        {
            return new CompanyFollowDto(
                existing.Id, existing.UserProfileId, existing.CompanyId,
                existing.Company?.Name ?? string.Empty,
                existing.Company?.Slug ?? string.Empty,
                existing.FollowedAt);
        }

        var company = await _companyRepository.GetByIdAsync(dto.CompanyId, cancellationToken)
            ?? throw new KeyNotFoundException("Company not found.");

        var follow = new CompanyFollow
        {
            UserProfileId = dto.UserProfileId,
            CompanyId = dto.CompanyId,
            FollowedAt = DateTime.UtcNow,
        };

        await _followRepository.AddAsync(follow, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CompanyFollowDto(
            follow.Id, follow.UserProfileId, follow.CompanyId,
            company.Name, company.Slug, follow.FollowedAt);
    }

    public async Task<bool> UnfollowAsync(
        Guid userProfileId, Guid companyId, CancellationToken cancellationToken = default)
    {
        var follow = await _followRepository.GetByUserAndCompanyAsync(userProfileId, companyId, cancellationToken);
        if (follow is null) return false;

        await _followRepository.DeleteAsync(follow, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task<bool> IsFollowingAsync(
        Guid userProfileId, Guid companyId, CancellationToken cancellationToken = default)
        => _followRepository.IsFollowingAsync(userProfileId, companyId, cancellationToken);

    public async Task<IReadOnlyList<JobDto>> GetNewJobsFromFollowedAsync(
        Guid userProfileId, int limit, CancellationToken cancellationToken = default)
    {
        var companyIds = await _followRepository.GetFollowedCompanyIdsAsync(userProfileId, cancellationToken);
        if (companyIds.Count == 0) return Array.Empty<JobDto>();

        var jobs = new List<Job>();
        foreach (var companyId in companyIds)
        {
            var (items, _) = await _jobRepository.SearchAsync(new JobQueryDto(
                Search: null, Page: 1, PageSize: limit,
                CompanyId: companyId, SortBy: "createdAt", SortOrder: "desc"), cancellationToken);

            jobs.AddRange(items);
        }

        var top = jobs
            .DistinctBy(j => j.Id)
            .OrderByDescending(j => j.CreatedAt)
            .Take(limit)
            .ToList();

        var badges = await _trendingService.GetTrendingBadgesAsync(top.Select(j => j.Id), cancellationToken);
        return top.Select(j => JobMapper.ToDto(j, badges.GetValueOrDefault(j.Id, Array.Empty<string>()))).ToList();
    }
}
