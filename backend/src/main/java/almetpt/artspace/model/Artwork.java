package almetpt.artspace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "artworks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Artwork extends GenericModel {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price")
    private BigDecimal price;

    @Column(name = "creation_date")
    private LocalDate creationDate;

    @Column(name = "medium")
    private String medium;

    @Column(name = "dimensions")
    private String dimensions;

    @Column(name = "img_path")
    private String imgPath;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private ArtCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id")
    private Artist artist;

    @ManyToMany(mappedBy = "artworks")
    private Set<Exhibition> exhibitions = new HashSet<>();
}
