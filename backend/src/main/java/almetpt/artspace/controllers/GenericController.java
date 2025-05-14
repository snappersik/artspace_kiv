package almetpt.artspace.controllers;

import almetpt.artspace.dto.GenericDTO;
import almetpt.artspace.model.GenericModel;
import almetpt.artspace.service.GenericService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page; // Import Page
import org.springframework.data.domain.Pageable; // Import Pageable
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@Slf4j
public abstract class GenericController<E extends GenericModel, D extends GenericDTO> {
    protected GenericService<E, D> service;

    protected GenericController(GenericService<E, D> genericService) {
        this.service = genericService;
    }

    @Operation(description = "Получить запись по Id", method = "getOneById")
    @GetMapping(value = "/getOneById") // More specific than @RequestMapping
    public ResponseEntity<D> getOneById(@RequestParam(value = "id") Long id) {
        return ResponseEntity.ok(service.getOne(id));
    }

    // This method will handle GET requests to the base path of the controller
    // e.g., GET /users?page=0&size=10, GET /artworks?page=0&size=10
    @Operation(description = "Получить все записи с пагинацией", method = "getAllPaginated")
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<D>> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.listAll(pageable));
    }

    // If you still need a non-paginated list for some specific "/getAll" endpoint
    @Operation(description = "Получить все записи (полный список)", method = "getAllList")
    @GetMapping(value = "/getAll", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<D>> getAllList() {
        return ResponseEntity.ok(service.listAll());
    }

    @Operation(description = "Создать запись", method = "add")
    @PostMapping(value = "/add", // More specific
            produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<D> create(@RequestBody D newEntity) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(newEntity));
    }

    @Operation(description = "Обновить запись", method = "update")
    @PutMapping(value = "/update", // More specific
            produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<D> update(@RequestBody D updateEntity,
                                    @RequestParam(value = "id") Long id) {
        updateEntity.setId(id); // Ensure DTO has ID for update if not passed in body
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(service.update(updateEntity));
    }
    
    @Operation(description = "Удалить запись", method = "delete")
    @DeleteMapping(value = "/delete/{id}") // More specific
    public ResponseEntity<Void> delete(@PathVariable(value = "id") Long id) {
        service.delete(id);
        return ResponseEntity.ok().build(); // Return 200 OK on successful deletion
    }
}
