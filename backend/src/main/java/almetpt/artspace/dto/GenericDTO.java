package almetpt.artspace.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public abstract class GenericDTO {
    private Long id;
    private LocalDateTime createdWhen;
    private String createdBy;
    private LocalDateTime updatedWhen;
    private String updatedBy;
    private Boolean isDeleted;
}
