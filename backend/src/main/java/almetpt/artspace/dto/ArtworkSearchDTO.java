package almetpt.artspace.dto;

import almetpt.artspace.model.ArtCategory;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class ArtworkSearchDTO {
    private String title;
    private ArtCategory category;
    private LocalDate createdAfter;
    private String artistName;
    private Long artistId;
}
