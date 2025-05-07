package almetpt.artspace.mapper;

import almetpt.artspace.dto.ArtistDTO;
import almetpt.artspace.model.Artist;
import almetpt.artspace.model.GenericModel;
import jakarta.annotation.PostConstruct;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class ArtistMapper extends GenericMapper<Artist, ArtistDTO> {

    public ArtistMapper(ModelMapper mapper) {
        super(Artist.class, ArtistDTO.class, mapper);
    }

    @Override
    @PostConstruct
    public void setupMapper() {
        modelMapper.createTypeMap(Artist.class, ArtistDTO.class)
                .addMappings(m -> m.skip(ArtistDTO::setArtworkIds))
                .setPostConverter(toDTOConverter());

        modelMapper.createTypeMap(ArtistDTO.class, Artist.class)
                .addMappings(m -> m.skip(Artist::setArtworks))
                .setPostConverter(toEntityConverter());
    }

    @Override
    protected void mapSpecificFields(ArtistDTO source, Artist destination) {
        // Поля artworks не устанавливаются здесь, так как это делается в сервисе
        destination.setArtworks(Collections.emptySet());
    }

    @Override
    protected void mapSpecificFields(Artist source, ArtistDTO destination) {
        destination.setArtworkIds(getIds(source));
    }

    @Override
    protected List<Long> getIds(Artist artist) {
        return Objects.isNull(artist) || Objects.isNull(artist.getArtworks())
                ? null
                : artist.getArtworks().stream()
                        .map(GenericModel::getId)
                        .collect(Collectors.toList());
    }
}
