package almetpt.artspace.mapper;

import almetpt.artspace.dto.ExhibitionDTO;
import almetpt.artspace.model.Exhibition;
import almetpt.artspace.model.GenericModel;
import jakarta.annotation.PostConstruct;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class ExhibitionMapper extends GenericMapper<Exhibition, ExhibitionDTO> {

    public ExhibitionMapper(ModelMapper mapper) {
        super(Exhibition.class, ExhibitionDTO.class, mapper);
    }

    @Override
    @PostConstruct
    public void setupMapper() {
        modelMapper.createTypeMap(Exhibition.class, ExhibitionDTO.class)
                .addMappings(m -> m.skip(ExhibitionDTO::setArtworkIds))
                .setPostConverter(toDTOConverter());

        modelMapper.createTypeMap(ExhibitionDTO.class, Exhibition.class)
                .addMappings(m -> {
                    m.skip(Exhibition::setArtworks);
                    m.skip(Exhibition::setTickets);
                })
                .setPostConverter(toEntityConverter());
    }

    @Override
    protected void mapSpecificFields(ExhibitionDTO source, Exhibition destination) {
        // Artworks и tickets устанавливаются в сервисе
        destination.setArtworks(Collections.emptySet());
        destination.setTickets(Collections.emptySet());
    }

    @Override
    protected void mapSpecificFields(Exhibition source, ExhibitionDTO destination) {
        destination.setArtworkIds(getIds(source));
    }

    @Override
    protected List<Long> getIds(Exhibition exhibition) {
        return Objects.isNull(exhibition) || Objects.isNull(exhibition.getArtworks())
                ? null
                : exhibition.getArtworks().stream()
                        .map(GenericModel::getId)
                        .collect(Collectors.toList());
    }
}
