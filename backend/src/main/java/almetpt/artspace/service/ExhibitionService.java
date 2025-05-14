package almetpt.artspace.service;

import almetpt.artspace.dto.ExhibitionDTO;
import almetpt.artspace.dto.ExhibitionSearchDTO;
import almetpt.artspace.mapper.ExhibitionMapper;
import almetpt.artspace.model.Artwork;
import almetpt.artspace.model.Exhibition;
import almetpt.artspace.repository.ArtworkRepository;
import almetpt.artspace.repository.ExhibitionRepository;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
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
        // Устанавливаем другие поля, которые могут не мапиться автоматически или требуют логики
        exhibition.setTitle(dto.getTitle());
        exhibition.setDescription(dto.getDescription());
        exhibition.setStartDate(dto.getStartDate());
        exhibition.setEndDate(dto.getEndDate());
        exhibition.setLocation(dto.getLocation());
        exhibition.setPrice(dto.getPrice()); // Убедитесь, что в DTO это поле BigDecimal
        exhibition.setImagePath(dto.getImagePath());


        Exhibition savedExhibition = exhibitionRepository.save(exhibition);
        return exhibitionMapper.toDTO((Exhibition) Hibernate.unproxy(savedExhibition));
    }

    @Override
    @Transactional
    public ExhibitionDTO update(ExhibitionDTO dto) {
        Exhibition exhibition = exhibitionRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Exhibition not found with id: " + dto.getId()));

        if (dto.getTitle() != null) exhibition.setTitle(dto.getTitle());
        if (dto.getDescription() != null) exhibition.setDescription(dto.getDescription());
        if (dto.getStartDate() != null) exhibition.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) exhibition.setEndDate(dto.getEndDate());
        if (dto.getLocation() != null) exhibition.setLocation(dto.getLocation());
        if (dto.getPrice() != null) exhibition.setPrice(dto.getPrice());
        if (dto.getImagePath() != null) exhibition.setImagePath(dto.getImagePath());


        if (dto.getArtworkIds() != null) { // Обновляем artworks только если artworkIds передан
            Set<Artwork> artworks = new HashSet<>();
            if (!dto.getArtworkIds().isEmpty()){
                artworks.addAll(artworkRepository.findAllById(dto.getArtworkIds()));
            }
            exhibition.setArtworks(artworks);
        }

        Exhibition updatedExhibition = exhibitionRepository.save(exhibition);
        return exhibitionMapper.toDTO((Exhibition) Hibernate.unproxy(updatedExhibition));
    }

    @Transactional(readOnly = true)
    public Page<ExhibitionDTO> findCurrentExhibitions(Pageable pageable) {
        LocalDate now = LocalDate.now();
        return exhibitionRepository
                .findByStartDateLessThanEqualAndEndDateGreaterThanEqual(now, now, pageable)
                .map(exh -> exhibitionMapper.toDTO((Exhibition) Hibernate.unproxy(exh)));
    }

    @Transactional(readOnly = true)
    public Page<ExhibitionDTO> findUpcomingExhibitions(Pageable pageable) {
        LocalDate now = LocalDate.now();
        return exhibitionRepository
                .findByStartDateAfter(now, pageable)
                .map(exh -> exhibitionMapper.toDTO((Exhibition) Hibernate.unproxy(exh)));
    }

    @Transactional(readOnly = true)
    public Page<ExhibitionDTO> findByTitle(String title, Pageable pageable) {
        Page<Exhibition> exhibitions = exhibitionRepository.findFiltered(title, null, null, null, pageable);
        return exhibitions.map(exh -> exhibitionMapper.toDTO((Exhibition) Hibernate.unproxy(exh)));
    }

    @Transactional(readOnly = true)
    public Page<ExhibitionDTO> search(ExhibitionSearchDTO searchDTO, Pageable pageable) {
        Page<Exhibition> exhibitions = exhibitionRepository.findFiltered(
                searchDTO.getTitle(),
                searchDTO.getLocation(), // Добавлен поиск по location
                searchDTO.getStartDate(),
                searchDTO.getEndDate(),
                pageable);
        return exhibitions.map(exh -> exhibitionMapper.toDTO((Exhibition) Hibernate.unproxy(exh)));
    }
}
