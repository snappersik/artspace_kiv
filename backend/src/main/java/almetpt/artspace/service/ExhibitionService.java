package almetpt.artspace.service;

import almetpt.artspace.dto.ExhibitionDTO;
import almetpt.artspace.dto.ExhibitionSearchDTO;
import almetpt.artspace.mapper.ExhibitionMapper;
import almetpt.artspace.model.Artwork;
import almetpt.artspace.model.Exhibition;
import almetpt.artspace.repository.ArtworkRepository;
import almetpt.artspace.repository.ExhibitionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
public class ExhibitionService extends GenericService<Exhibition, ExhibitionDTO> {

    private final ExhibitionRepository exhibitionRepository;
    private final ArtworkRepository artworkRepository;
    private final ExhibitionMapper exhibitionMapper;

    public ExhibitionService(ExhibitionRepository exhibitionRepository,
            ArtworkRepository artworkRepository,
            ExhibitionMapper exhibitionMapper) {
        super(exhibitionRepository, exhibitionMapper);
        this.exhibitionRepository = exhibitionRepository;
        this.artworkRepository = artworkRepository;
        this.exhibitionMapper = exhibitionMapper;
    }

    @Override
    @Transactional
    public ExhibitionDTO create(ExhibitionDTO dto) {
        Exhibition exhibition = exhibitionMapper.toEntity(dto);

        if (dto.getArtworkIds() != null && !dto.getArtworkIds().isEmpty()) {
            Set<Artwork> artworks = new HashSet<>(artworkRepository.findAllById(dto.getArtworkIds()));
            exhibition.setArtworks(artworks);
        }

        return exhibitionMapper.toDTO(exhibitionRepository.save(exhibition));
    }

    @Override
    @Transactional
    public ExhibitionDTO update(ExhibitionDTO dto) {
        Exhibition exhibition = exhibitionRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Exhibition not found with id: " + dto.getId()));

        // Вручную обновляем поля
        if (dto.getTitle() != null)
            exhibition.setTitle(dto.getTitle());
        if (dto.getDescription() != null)
            exhibition.setDescription(dto.getDescription());
        if (dto.getStartDate() != null)
            exhibition.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null)
            exhibition.setEndDate(dto.getEndDate());
        if (dto.getLocation() != null)
            exhibition.setLocation(dto.getLocation());

        if (dto.getArtworkIds() != null && !dto.getArtworkIds().isEmpty()) {
            Set<Artwork> artworks = new HashSet<>(artworkRepository.findAllById(dto.getArtworkIds()));
            exhibition.setArtworks(artworks);
        }

        return exhibitionMapper.toDTO(exhibitionRepository.save(exhibition));
    }

    @Transactional(readOnly = true)
    public Page<ExhibitionDTO> findCurrentExhibitions(Pageable pageable) {
        LocalDate now = LocalDate.now();
        return exhibitionRepository
                .findByStartDateLessThanEqualAndEndDateGreaterThanEqual(now, now, pageable)
                .map(exhibitionMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<ExhibitionDTO> findUpcomingExhibitions(Pageable pageable) {
        LocalDate now = LocalDate.now();
        return exhibitionRepository
                .findByStartDateAfter(now, pageable)
                .map(exhibitionMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<ExhibitionDTO> findByTitle(String title, Pageable pageable) {
        Page<Exhibition> exhibitions = exhibitionRepository.findFiltered(title, null, null, pageable);
        List<ExhibitionDTO> dtos = exhibitionMapper.toDTOList(exhibitions.getContent());
        return new PageImpl<>(dtos, pageable, exhibitions.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<ExhibitionDTO> search(ExhibitionSearchDTO searchDTO, Pageable pageable) {
        Page<Exhibition> exhibitions = exhibitionRepository.findFiltered(
                searchDTO.getTitle(),
                searchDTO.getStartDate(),
                searchDTO.getEndDate(),
                pageable);
        List<ExhibitionDTO> dtos = exhibitionMapper.toDTOList(exhibitions.getContent());
        return new PageImpl<>(dtos, pageable, exhibitions.getTotalElements());
    }
}
