using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Common.Mapping;
using SwipeJobs.Application.Modules.Sources.Interfaces;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Modules.Sources.Services;

public class SourceService : ISourceService
{
    private readonly ISourceRepository _sourceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SourceService(ISourceRepository sourceRepository, IUnitOfWork unitOfWork)
    {
        _sourceRepository = sourceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SourceDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var sources = await _sourceRepository.GetAllAsync(cancellationToken);
        return sources.Select(SourceMapper.ToDto).ToList();
    }

    public async Task<SourceDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var source = await _sourceRepository.GetByIdAsync(id, cancellationToken);
        return source is null ? null : SourceMapper.ToDto(source);
    }

    public async Task<SourceDto> CreateAsync(CreateSourceDto dto, CancellationToken cancellationToken = default)
    {
        var source = new Source
        {
            Name = dto.Name,
            Type = dto.Type,
            ExternalIdentifier = dto.ExternalIdentifier,
            IsActive = true,
        };
        await _sourceRepository.AddAsync(source, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return SourceMapper.ToDto(source);
    }

    public async Task<SourceDto?> UpdateAsync(Guid id, UpdateSourceDto dto, CancellationToken cancellationToken = default)
    {
        var source = await _sourceRepository.GetByIdAsync(id, cancellationToken);
        if (source is null) return null;

        source.Name = dto.Name;
        source.Type = dto.Type;
        source.ExternalIdentifier = dto.ExternalIdentifier;
        source.IsActive = dto.IsActive;
        await _sourceRepository.UpdateAsync(source, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return SourceMapper.ToDto(source);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var source = await _sourceRepository.GetByIdAsync(id, cancellationToken);
        if (source is null) return false;

        source.IsActive = false;
        await _sourceRepository.UpdateAsync(source, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
