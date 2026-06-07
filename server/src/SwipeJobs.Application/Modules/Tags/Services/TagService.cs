using SwipeJobs.Application.Common.Dtos;
using SwipeJobs.Application.Common.Interfaces;
using SwipeJobs.Application.Common.Interfaces.Repositories;
using SwipeJobs.Application.Common.Mapping;
using SwipeJobs.Application.Modules.Tags.Interfaces;
using SwipeJobs.Domain.Entities;

namespace SwipeJobs.Application.Modules.Tags.Services;

public class TagService : ITagService
{
    private readonly ITagRepository _tagRepository;
    private readonly IUnitOfWork _unitOfWork;

    public TagService(ITagRepository tagRepository, IUnitOfWork unitOfWork)
    {
        _tagRepository = tagRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<TagDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var tags = await _tagRepository.GetAllAsync(cancellationToken);
        return tags.Select(TagMapper.ToDto).ToList();
    }

    public async Task<TagDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var tag = await _tagRepository.GetByIdAsync(id, cancellationToken);
        return tag is null ? null : TagMapper.ToDto(tag);
    }

    public async Task<TagDto> CreateAsync(CreateTagDto dto, CancellationToken cancellationToken = default)
    {
        var tag = new Tag
        {
            Name = dto.Name,
            Slug = dto.Slug ?? dto.Name.ToLower().Replace(' ', '-'),
        };
        await _tagRepository.AddAsync(tag, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return TagMapper.ToDto(tag);
    }

    public async Task<TagDto?> UpdateAsync(Guid id, UpdateTagDto dto, CancellationToken cancellationToken = default)
    {
        var tag = await _tagRepository.GetByIdAsync(id, cancellationToken);
        if (tag is null) return null;

        tag.Name = dto.Name;
        tag.Slug = dto.Slug ?? dto.Name.ToLower().Replace(' ', '-');
        await _tagRepository.UpdateAsync(tag, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return TagMapper.ToDto(tag);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var tag = await _tagRepository.GetByIdAsync(id, cancellationToken);
        if (tag is null) return false;

        await _tagRepository.DeleteAsync(tag, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
