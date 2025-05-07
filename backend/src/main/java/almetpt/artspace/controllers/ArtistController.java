package almetpt.artspace.controllers;

import almetpt.artspace.dto.ArtistDTO;
import almetpt.artspace.dto.ArtistSearchDTO;
import almetpt.artspace.model.Artist;
import almetpt.artspace.service.ArtistService;
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
@RequestMapping("/api/artists")
@Tag(name = "Artists", description = "API для работы с художниками")
public class ArtistController extends GenericController<Artist, ArtistDTO> {

    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) {
        super(artistService);
        this.artistService = artistService;
    }

    @Operation(summary = "Поиск художников по имени", description = "Позволяет найти художников по части имени")
    @GetMapping("/search/by-name")
    public ResponseEntity<Page<ArtistDTO>> findByName(
            @Parameter(description = "Часть имени художника") @RequestParam String name,
            @Parameter(description = "Номер страницы (начиная с 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Размер страницы") @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("name"));
        return ResponseEntity.ok(artistService.findByName(name, pageable));
    }
    
    @Operation(summary = "Поиск художников по стране происхождения", description = "Позволяет найти художников по стране")
    @GetMapping("/search/by-country")
    public ResponseEntity<Page<ArtistDTO>> findByCountry(
            @Parameter(description = "Страна происхождения") @RequestParam String country,
            @Parameter(description = "Номер страницы (начиная с 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Размер страницы") @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("name"));
        return ResponseEntity.ok(artistService.findByCountry(country, pageable));
    }
    
    @Operation(summary = "Расширенный поиск художников", description = "Позволяет искать художников по нескольким параметрам")
    @PostMapping("/search")
    public ResponseEntity<Page<ArtistDTO>> search(
            @Parameter(description = "Параметры поиска") @RequestBody ArtistSearchDTO searchDTO,
            @Parameter(description = "Номер страницы (начиная с 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Размер страницы") @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("name"));
        return ResponseEntity.ok(artistService.search(searchDTO, pageable));
    }
}
