package almetpt.artspace.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class ExhibitionSearchDTO {
    private String title;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
}
