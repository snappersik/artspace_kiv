package almetpt.artspace.controllers;

import almetpt.artspace.dto.ArtworkDTO;
import almetpt.artspace.dto.ArtworkSearchDTO;
import almetpt.artspace.model.ArtCategory;
import almetpt.artspace.model.Artwork;
import almetpt.artspace.service.ArtworkService;
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
@RequestMapping("/api/artworks")
@Tag(name = "Artworks", description = "API для работы с произведениями искусства")
public class ArtworkController extends GenericController<Artwork, ArtworkDTO> {

    private final ArtworkService artworkService;

    public ArtworkController(ArtworkService artworkService) {
        super(artworkService);
        this.artworkService = artworkService;
    }

    @Operation(summary = "Поиск произведений по названию", description = "Позволяет найти произведения по части названия")
    @GetMapping("/search/by-title")
    public ResponseEntity<Page<ArtworkDTO>> findByTitle(
            @Parameter(description = "Часть названия произведения") @RequestParam String title,
            @Parameter(description = "Номер страницы (начиная с 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Размер страницы") @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("title"));
        return ResponseEntity.ok(artworkService.findByTitle(title, pageable));
    }

    @GetMapping("/search/by-category")
    public ResponseEntity<Page<ArtworkDTO>> findByCategory(
            @RequestParam ArtCategory category,
            @Parameter(hidden = true) Pageable pageable) {
        return ResponseEntity.ok(artworkService.findByCategory(category, pageable));
    }

    @Operation(summary = "Поиск произведений по имени художника", description = "Позволяет найти произведения по имени их создателя")
    @GetMapping("/search/by-artist-name")
    public ResponseEntity<Page<ArtworkDTO>> findByArtistName(
            @Parameter(description = "Имя художника") @RequestParam String artistName,
            @Parameter(description = "Номер страницы (начиная с 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Размер страницы") @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("title"));
        return ResponseEntity.ok(artworkService.findByArtistName(artistName, pageable));
    }

    @Operation(summary = "Расширенный поиск произведений", description = "Позволяет искать произведения по нескольким параметрам")
    @PostMapping("/search")
    public ResponseEntity<Page<ArtworkDTO>> search(
            @Parameter(description = "Параметры поиска") @RequestBody ArtworkSearchDTO searchDTO,
            @Parameter(description = "Номер страницы (начиная с 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Размер страницы") @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("title"));
        return ResponseEntity.ok(artworkService.search(searchDTO, pageable));
    }
}
