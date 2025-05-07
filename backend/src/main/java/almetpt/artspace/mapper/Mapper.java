package almetpt.artspace.mapper;

import almetpt.artspace.dto.GenericDTO;
import almetpt.artspace.model.GenericModel;
import java.util.List;

public interface Mapper<E extends GenericModel, D extends GenericDTO> {
    E toEntity(D dto);
    D toDTO(E entity);
    List<E> toEntityList(List<D> dtos);
    List<D> toDTOList(List<E> entities);
    void updateEntityFromDTO(D dto, E entity);
}
