package almetpt.artspace.mapper;

import almetpt.artspace.dto.GenericDTO;
import almetpt.artspace.model.GenericModel;
import jakarta.annotation.PostConstruct;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public abstract class GenericMapper<E extends GenericModel, D extends GenericDTO> {

    private final Class<E> entityClass;
    private final Class<D> dtoClass;
    protected final ModelMapper modelMapper;

    public GenericMapper(Class<E> entityClass, Class<D> dtoClass, ModelMapper modelMapper) {
        this.entityClass = entityClass;
        this.dtoClass = dtoClass;
        this.modelMapper = modelMapper;
    }

    public E toEntity(D dto) {
        return Objects.isNull(dto) ? null : modelMapper.map(dto, entityClass);
    }

    public D toDTO(E entity) {
        return Objects.isNull(entity) ? null : modelMapper.map(entity, dtoClass);
    }

    public List<E> toEntityList(List<D> dtos) {
        return dtos.stream().map(this::toEntity).toList();
    }

    public List<D> toDTOList(List<E> entities) {
        return entities.stream().map(this::toDTO).toList();
    }

    public void updateEntityFromDto(D dto, E entity) {
        if (dto != null && entity != null) {
            modelMapper.map(dto, entity);
            mapSpecificFields(dto, entity);
        }
    }

    // Конвертеры для mapSpecificFields
    protected Converter<E, D> toDTOConverter() {
        return context -> {
            E source = context.getSource();
            D destination = context.getDestination();
            mapSpecificFields(source, destination);
            return context.getDestination();
        };
    }

    protected Converter<D, E> toEntityConverter() {
        return context -> {
            D source = context.getSource();
            E destination = context.getDestination();
            mapSpecificFields(source, destination);
            return context.getDestination();
        };
    }

    protected abstract void mapSpecificFields(D source, E destination);
    protected abstract void mapSpecificFields(E source, D destination);

    @PostConstruct
    protected abstract void setupMapper();

    protected abstract List<Long> getIds(E entity);
}
