package almetpt.artspace.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ArtistDTO extends GenericDTO {
    private String name;
    private String biography;
    private LocalDate birthDate;
    private String country;
    private String contactInfo;
    private String photoPath;
    private List<Long> artworkIds;
}
