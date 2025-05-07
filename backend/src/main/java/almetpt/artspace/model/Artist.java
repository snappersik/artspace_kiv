package almetpt.artspace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "artists")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Artist extends GenericModel {

    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "biography", columnDefinition = "TEXT")
    private String biography;
    
    @Column(name = "birth_date")
    private LocalDate birthDate;
    
    @Column(name = "country")
    private String country;
    
    @Column(name = "contact_info")
    private String contactInfo;
    
    @Column(name = "photo_path")
    private String photoPath;
    
    @OneToMany(mappedBy = "artist", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Artwork> artworks = new HashSet<>();
    
}
