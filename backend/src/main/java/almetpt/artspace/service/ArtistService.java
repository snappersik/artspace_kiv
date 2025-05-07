package almetpt.artspace.service;

import almetpt.artspace.dto.ArtistDTO;
import almetpt.artspace.dto.ArtistSearchDTO;
import almetpt.artspace.mapper.ArtistMapper;
import almetpt.artspace.model.Artist;
import almetpt.artspace.repository.ArtistRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
public class ArtistService extends GenericService<Artist, ArtistDTO> {

    private final ArtistRepository artistRepository;
    private final ArtistMapper artistMapper;

    public ArtistService(ArtistRepository artistRepository, ArtistMapper artistMapper) {
        super(artistRepository, artistMapper);
        this.artistRepository = artistRepository;
        this.artistMapper = artistMapper;
    }

    @Transactional(readOnly = true)
    public Page<ArtistDTO> findByName(String name, Pageable pageable) {
        Page<Artist> artists = artistRepository.findByNameContainingIgnoreCase(name, pageable);
        List<ArtistDTO> dtos = artistMapper.toDTOList(artists.getContent());
        return new PageImpl<>(dtos, pageable, artists.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<ArtistDTO> findByCountry(String country, Pageable pageable) {
        Page<Artist> artists = artistRepository.findByCountry(country, pageable);
        List<ArtistDTO> dtos = artistMapper.toDTOList(artists.getContent());
        return new PageImpl<>(dtos, pageable, artists.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<ArtistDTO> search(ArtistSearchDTO searchDTO, Pageable pageable) {
        Page<Artist> artists = artistRepository.findFiltered(
                searchDTO.getName(),
                searchDTO.getCountry(),
                pageable);
        return artists.map(artistMapper::toDTO);
    }

}
