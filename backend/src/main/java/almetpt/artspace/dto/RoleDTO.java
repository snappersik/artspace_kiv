package almetpt.artspace.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RoleDTO extends GenericDTO {
    private String title;
    private String description;
    private List<Long> userIds;
}
