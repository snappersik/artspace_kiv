package almetpt.artspace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.Set;

@Entity
@Table(name = "roles")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Role extends GenericModel {

    @Column(name = "title", nullable = false, unique = true)
    private String title;
    
    @Column(name = "description")
    private String description;
    
    @OneToMany(mappedBy = "role")
    private Set<User> users;
}
