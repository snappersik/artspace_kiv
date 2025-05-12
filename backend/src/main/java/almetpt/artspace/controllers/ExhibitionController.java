package almetpt.artspace.controllers;

import almetpt.artspace.dto.ExhibitionDTO;
import almetpt.artspace.dto.ExhibitionSearchDTO;
import almetpt.artspace.model.Exhibition;
import almetpt.artspace.service.ExhibitionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/exhibitions")
@Tag(name = "Exhibitions", description = "API для работы с выставками")
public class ExhibitionController extends GenericController<Exhibition, ExhibitionDTO> {

    private final ExhibitionService exhibitionService;

    public ExhibitionController(ExhibitionService exhibitionService) {
        super(exhibitionService);
        this.exhibitionService = exhibitionService;
    }

    @GetMapping("/current")
    public ResponseEntity<Page<ExhibitionDTO>> getCurrentExhibitions(
            @Parameter(hidden = true) Pageable pageable) {

        return ResponseEntity.ok(exhibitionService.findCurrentExhibitions(pageable));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<Page<ExhibitionDTO>> getUpcomingExhibitions(
            @Parameter(hidden = true) Pageable pageable) {

        return ResponseEntity.ok(exhibitionService.findUpcomingExhibitions(pageable));
    }

    @Operation(summary = "Поиск выставок по названию", description = "Позволяет найти выставки по части названия")
    @GetMapping("/search/by-title")
    public ResponseEntity<Page<ExhibitionDTO>> findByTitle(
            @Parameter(description = "Часть названия выставки") @RequestParam String title,
            @Parameter(description = "Номер страницы (начиная с 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Размер страницы") @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("startDate").descending());
        return ResponseEntity.ok(exhibitionService.findByTitle(title, pageable));
    }

    @Operation(summary = "Расширенный поиск выставок", description = "Позволяет искать выставки по нескольким параметрам")
    @PostMapping("/search")
    public ResponseEntity<Page<ExhibitionDTO>> search(
            @Parameter(description = "Параметры поиска") @RequestBody ExhibitionSearchDTO searchDTO,
            @Parameter(description = "Номер страницы (начиная с 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Размер страницы") @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("startDate").descending());
        return ResponseEntity.ok(exhibitionService.search(searchDTO, pageable));
    }
}
