package almetpt.artspace.repository;

import almetpt.artspace.model.ArtCategory;
import almetpt.artspace.model.Artwork;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

@Repository
public interface ArtworkRepository extends GenericRepository<Artwork> {
    @Query("SELECT a FROM Artwork a JOIN a.artist art WHERE art.name LIKE %:artistName%")
    Page<Artwork> findByArtistNameContainingIgnoreCase(
            @Param("artistName") String artistName,
            Pageable pageable);
            
    Page<Artwork> findByCategory(ArtCategory category, Pageable pageable);
    
    Page<Artwork> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @Query("SELECT a FROM Artwork a WHERE " +
           "(:title IS NULL OR a.title LIKE %:title%) AND " +
           "(:category IS NULL OR a.category = :category)")
    Page<Artwork> findFiltered(
            @Param("title") String title,
            @Param("category") ArtCategory category,
            Pageable pageable);

    @Query("SELECT a FROM Artwork a WHERE " +
           "(:title IS NULL OR a.title LIKE %:title%) AND " +
           "(:category IS NULL OR a.category = :category) AND " +
           "(:createdAfter IS NULL OR a.creationDate >= :createdAfter) AND " +
           "(:artistName IS NULL OR a.artist.name LIKE %:artistName%)")
    Page<Artwork> searchArtworks(
            @Param("title") String title,
            @Param("category") ArtCategory category,
            @Param("createdAfter") LocalDate createdAfter,
            @Param("artistName") String artistName,
            Pageable pageable);
}
