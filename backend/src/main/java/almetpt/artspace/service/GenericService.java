package almetpt.artspace.service;

import almetpt.artspace.dto.GenericDTO;
import almetpt.artspace.mapper.GenericMapper;
import almetpt.artspace.model.GenericModel;
import almetpt.artspace.exception.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public abstract class GenericService<E extends GenericModel, D extends GenericDTO> {

    protected final JpaRepository<E, Long> repository;
    protected final GenericMapper<E, D> mapper;

    public GenericService(JpaRepository<E, Long> repository, GenericMapper<E, D> mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public D getOne(Long id) {
        E entity = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Entity not found with id: " + id));
        return mapper.toDTO(entity);
    }

    @Transactional(readOnly = true)
    public List<D> listAll() {
        return mapper.toDTOList(repository.findAll());
    }

    @Transactional(readOnly = true)
    public Page<D> listAll(Pageable pageable) {
        Page<E> entityPage = repository.findAll(pageable);
        return entityPage.map(mapper::toDTO);
    }

    @Transactional
    public D create(D dto) {
        E entity = mapper.toEntity(dto);
        E savedEntity = repository.save(entity);
        return mapper.toDTO(savedEntity);
    }

    @Transactional
    public D update(D dto) {
        if (dto.getId() == null) {
            throw new IllegalArgumentException("ID cannot be null for update");
        }
        E entity = repository.findById(dto.getId())
                .orElseThrow(() -> new NotFoundException("Cannot update. Entity not found with id: " + dto.getId()));
        mapper.updateEntityFromDto(dto, entity);
        E updatedEntity = repository.save(entity);
        return mapper.toDTO(updatedEntity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Cannot delete. Entity not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
