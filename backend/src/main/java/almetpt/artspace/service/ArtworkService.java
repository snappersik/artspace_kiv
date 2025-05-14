package almetpt.artspace.service;

import almetpt.artspace.dto.ArtworkDTO;
import almetpt.artspace.dto.ArtworkSearchDTO;
import almetpt.artspace.mapper.ArtworkMapper;
import almetpt.artspace.model.Artist;
import almetpt.artspace.model.Artwork;
import almetpt.artspace.model.ArtCategory;
import almetpt.artspace.repository.ArtistRepository;
import almetpt.artspace.repository.ArtworkRepository;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class ArtworkService extends GenericService<Artwork, ArtworkDTO> {

    private final ArtworkRepository artworkRepository;
    private final ArtistRepository artistRepository;
    private final ArtworkMapper artworkMapper;

    public ArtworkService(ArtworkRepository artworkRepository,
                         ArtistRepository artistRepository,
                         ArtworkMapper artworkMapper) {
        super(artworkRepository, artworkMapper);
        this.artworkRepository = artworkRepository;
        this.artistRepository = artistRepository;
        this.artworkMapper = artworkMapper;
    }

    @Override
    @Transactional
    public ArtworkDTO create(ArtworkDTO dto) {
        log.info("Creating artwork with title: {}", dto.getTitle());
        Artwork artwork = artworkMapper.toEntity(dto); // DTO -> Entity
        Artist fetchedArtist = null;

        if (dto.getArtistId() != null) {
            log.info("Fetching artist with ID: {}", dto.getArtistId());
            fetchedArtist = artistRepository.findById(dto.getArtistId())
                    .orElseThrow(() -> {
                        log.error("Artist not found with id: {}", dto.getArtistId());
                        return new RuntimeException("Artist not found with id: " + dto.getArtistId());
                    });
            artwork.setArtist(fetchedArtist);
        } else {
            artwork.setArtist(null); // Явно устанавливаем null, если художник не выбран
            log.info("No artist ID provided for artwork: {}", dto.getTitle());
        }
            
        // Установка полей из DTO в сущность
        artwork.setTitle(dto.getTitle());
        artwork.setDescription(dto.getDescription());
        artwork.setCategory(dto.getCategory()); // ArtCategory enum
        artwork.setCreationDate(dto.getCreationDate());
        artwork.setPrice(dto.getPrice());
        artwork.setImgPath(dto.getImgPath());

        Artwork savedArtwork = artworkRepository.save(artwork);
        log.info("Artwork saved with ID: {}", savedArtwork.getId());

        // Маппинг сохраненной сущности (с разыменованием прокси) в DTO
        ArtworkDTO resultDTO = artworkMapper.toDTO((Artwork) Hibernate.unproxy(savedArtwork));

        // Установка данных о художнике в DTO, используя ранее загруженного художника (fetchedArtist)
        // Это гарантирует, что мы работаем с полностью инициализированным объектом художника
        if (fetchedArtist != null) {
            resultDTO.setArtistId(fetchedArtist.getId());
            resultDTO.setArtistName(fetchedArtist.getName());
        } else {
            resultDTO.setArtistId(null);
            resultDTO.setArtistName(null);
        }
        
        // Убедимся, что imgPath также корректно перенесен в DTO (хотя mapper должен это делать)
        resultDTO.setImgPath(savedArtwork.getImgPath());
        
        log.info("Artwork DTO created for ID: {}", resultDTO.getId());
        return resultDTO;
    }

    @Override
    @Transactional
    public ArtworkDTO update(ArtworkDTO dto) {
        log.info("Updating artwork with ID: {}", dto.getId());
        Artwork artwork = artworkRepository.findById(dto.getId())
                .orElseThrow(() -> {
                     log.error("Artwork not found with id: {}", dto.getId());
                     return new RuntimeException("Artwork not found with id: " + dto.getId());
                });
            
        Artist fetchedArtist = null;
        if (dto.getArtistId() != null) {
            // Проверяем, изменился ли художник или был ли он ранее не установлен
            if (artwork.getArtist() == null || !artwork.getArtist().getId().equals(dto.getArtistId())) {
                log.info("Artist changed or was null. Fetching new artist with ID: {}", dto.getArtistId());
                fetchedArtist = artistRepository.findById(dto.getArtistId())
                        .orElseThrow(() -> {
                            log.error("Artist not found with id: {}", dto.getArtistId());
                            return new RuntimeException("Artist not found with id: " + dto.getArtistId());
                        });
                artwork.setArtist(fetchedArtist);
            } else {
                 fetchedArtist = artwork.getArtist(); // Художник не изменился, используем существующего
            }
        } else {
            artwork.setArtist(null); // Если artistId не передан или пуст, художник удаляется
            log.info("Artist ID is null. Removing artist association from artwork ID: {}", dto.getId());
        }
            
        // Обновление полей сущности из DTO
        if (dto.getTitle() != null) artwork.setTitle(dto.getTitle());
        if (dto.getDescription() != null) artwork.setDescription(dto.getDescription());
        if (dto.getCategory() != null) artwork.setCategory(dto.getCategory());
        if (dto.getCreationDate() != null) artwork.setCreationDate(dto.getCreationDate());
        if (dto.getPrice() != null) artwork.setPrice(dto.getPrice()); // Убедитесь, что тип BigDecimal
        if (dto.getImgPath() != null) artwork.setImgPath(dto.getImgPath());

        Artwork updatedArtwork = artworkRepository.save(artwork);
        log.info("Artwork updated for ID: {}", updatedArtwork.getId());
        
        ArtworkDTO resultDTO = artworkMapper.toDTO((Artwork) Hibernate.unproxy(updatedArtwork));

        // Установка данных о художнике в DTO
        if (fetchedArtist != null) { // Если художник был явно загружен (изменился или был назначен)
            resultDTO.setArtistId(fetchedArtist.getId());
            resultDTO.setArtistName(fetchedArtist.getName());
        } else if (artwork.getArtist() != null) { // Если художник не менялся, но был (dto.getArtistId() был равен текущему)
             resultDTO.setArtistId(artwork.getArtist().getId());
             resultDTO.setArtistName(artwork.getArtist().getName());
        } else { // Художника нет
            resultDTO.setArtistId(null);
            resultDTO.setArtistName(null);
        }
        
        resultDTO.setImgPath(updatedArtwork.getImgPath());
        log.info("Artwork DTO updated for ID: {}", resultDTO.getId());
        return resultDTO;
    }

    @Transactional(readOnly = true)
    public Page<ArtworkDTO> findByTitle(String title, Pageable pageable) {
        Page<Artwork> artworks = artworkRepository.findByTitleContainingIgnoreCase(title, pageable);
        return artworks.map(art -> artworkMapper.toDTO((Artwork) Hibernate.unproxy(art)));
    }

    @Transactional(readOnly = true)
    public Page<ArtworkDTO> findByCategory(ArtCategory category, Pageable pageable) {
        Page<Artwork> artworks = artworkRepository.findByCategory(category, pageable);
        return artworks.map(art -> artworkMapper.toDTO((Artwork) Hibernate.unproxy(art)));
    }

    @Transactional(readOnly = true)
    public Page<ArtworkDTO> search(ArtworkSearchDTO searchDTO, Pageable pageable) {
        return artworkRepository.searchArtworks(
                searchDTO.getTitle(),
                searchDTO.getCategory(),
                searchDTO.getCreatedAfter(),
                searchDTO.getArtistName(),
                pageable).map(art -> artworkMapper.toDTO((Artwork) Hibernate.unproxy(art)));
    }

    @Transactional(readOnly = true)
    public Page<ArtworkDTO> findByArtistName(String artistName, Pageable pageable) {
        return artworkRepository
                .findByArtistNameContainingIgnoreCase(artistName, pageable)
                .map(art -> artworkMapper.toDTO((Artwork) Hibernate.unproxy(art)));
    }
}