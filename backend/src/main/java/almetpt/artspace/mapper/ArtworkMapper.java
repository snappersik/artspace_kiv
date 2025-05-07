package almetpt.artspace.mapper;

import almetpt.artspace.dto.ArtworkDTO;
import almetpt.artspace.model.Artwork;
import almetpt.artspace.model.GenericModel;
import jakarta.annotation.PostConstruct;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class ArtworkMapper extends GenericMapper<Artwork, ArtworkDTO> {

    public ArtworkMapper(ModelMapper mapper) {
        super(Artwork.class, ArtworkDTO.class, mapper);
    }

    @Override
    @PostConstruct
    public void setupMapper() {
        modelMapper.createTypeMap(Artwork.class, ArtworkDTO.class)
                .addMappings(m -> {
                    m.skip(ArtworkDTO::setExhibitionIds);
                    m.map(src -> src.getArtist() != null ? src.getArtist().getId() : null, ArtworkDTO::setArtistId);
                    m.map(src -> src.getArtist() != null ? src.getArtist().getName() : null, ArtworkDTO::setArtistName);
                })
                .setPostConverter(toDTOConverter());

        modelMapper.createTypeMap(ArtworkDTO.class, Artwork.class)
                .addMappings(m -> {
                    m.skip(Artwork::setArtist);
                    m.skip(Artwork::setExhibitions);
                })
                .setPostConverter(toEntityConverter());
    }

    @Override
    protected void mapSpecificFields(ArtworkDTO source, Artwork destination) {
        // Artist и exhibitions устанавливаются в сервисе
        destination.setExhibitions(Collections.emptySet());
    }

    @Override
    protected void mapSpecificFields(Artwork source, ArtworkDTO destination) {
        destination.setExhibitionIds(getIds(source));
    }

    @Override
    protected List<Long> getIds(Artwork artwork) {
        return Objects.isNull(artwork) || Objects.isNull(artwork.getExhibitions())
                ? null
                : artwork.getExhibitions().stream()
                        .map(GenericModel::getId)
                        .collect(Collectors.toList());
    }
}
