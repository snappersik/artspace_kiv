package almetpt.artspace.dto;

import almetpt.artspace.model.ArtCategory;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ArtworkDTO extends GenericDTO {
    private String title;
    private String description;
    private BigDecimal price;
    private LocalDate creationDate;
    private String medium;
    private String dimensions;
    private String imgPath;
    private ArtCategory category;
    private Long artistId;
    private String artistName;
    private List<Long> exhibitionIds;
}
