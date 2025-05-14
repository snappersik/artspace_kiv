package almetpt.artspace.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSearchDTO {
    private String login;
    private String email;
    private String firstName;
    private String lastName;
    private String roleName;
}
