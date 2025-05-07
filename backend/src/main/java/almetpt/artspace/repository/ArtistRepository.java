package almetpt.artspace.repository;

import almetpt.artspace.model.Artist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ArtistRepository extends GenericRepository<Artist> {
    Page<Artist> findByCountry(String country, Pageable pageable);
    Page<Artist> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT a FROM Artist a WHERE " +
           "(:name IS NULL OR a.name LIKE %:name%) AND " +
           "(:country IS NULL OR a.country = :country)")
    Page<Artist> findFiltered(@Param("name") String name,
                             @Param("country") String country,
                             Pageable pageable);
}
