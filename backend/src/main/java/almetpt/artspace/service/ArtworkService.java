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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

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
        Artwork artwork = artworkMapper.toEntity(dto);
        if (dto.getArtistId() != null) {
            Artist artist = artistRepository.findById(dto.getArtistId())
                    .orElseThrow(() -> new RuntimeException("Artist not found with id: " + dto.getArtistId()));
            artwork.setArtist(artist);
        }
        return artworkMapper.toDTO(artworkRepository.save(artwork));
    }

    @Override
    @Transactional
    public ArtworkDTO update(ArtworkDTO dto) {
        Artwork artwork = artworkRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Artwork not found with id: " + dto.getId()));
        
        // Вручную обновляем поля
        if (dto.getTitle() != null) artwork.setTitle(dto.getTitle());
        if (dto.getDescription() != null) artwork.setDescription(dto.getDescription());
        if (dto.getCategory() != null) artwork.setCategory(dto.getCategory());
        if (dto.getCreationDate() != null) artwork.setCreationDate(dto.getCreationDate());
        if (dto.getPrice() != null) artwork.setPrice(dto.getPrice());
        
        if (dto.getArtistId() != null) {
            Artist artist = artistRepository.findById(dto.getArtistId())
                    .orElseThrow(() -> new RuntimeException("Artist not found with id: " + dto.getArtistId()));
            artwork.setArtist(artist);
        }
        
        return artworkMapper.toDTO(artworkRepository.save(artwork));
    }

    @Transactional(readOnly = true)
    public Page<ArtworkDTO> findByTitle(String title, Pageable pageable) {
        Page<Artwork> artworks = artworkRepository.findByTitleContainingIgnoreCase(title, pageable);
        List<ArtworkDTO> dtos = artworkMapper.toDTOList(artworks.getContent());
        return new PageImpl<>(dtos, pageable, artworks.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<ArtworkDTO> findByCategory(ArtCategory category, Pageable pageable) {
        Page<Artwork> artworks = artworkRepository.findByCategory(category, pageable);
        List<ArtworkDTO> dtos = artworkMapper.toDTOList(artworks.getContent());
        return new PageImpl<>(dtos, pageable, artworks.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<ArtworkDTO> search(ArtworkSearchDTO searchDTO, Pageable pageable) {
        return artworkRepository.findFiltered(
                searchDTO.getTitle(),
                searchDTO.getCategory(),
                pageable).map(artworkMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<ArtworkDTO> findByArtistName(String artistName, Pageable pageable) {
        return artworkRepository
                .findByArtistNameContainingIgnoreCase(artistName, pageable)
                .map(artworkMapper::toDTO);
    }
}
