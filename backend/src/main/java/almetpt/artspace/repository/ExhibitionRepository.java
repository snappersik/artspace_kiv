package almetpt.artspace.repository;

import almetpt.artspace.model.Exhibition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExhibitionRepository extends GenericRepository<Exhibition> {
       List<Exhibition> findByStartDateAfterAndEndDateBefore(LocalDate startDate, LocalDate endDate);

       List<Exhibition> findByEndDateBefore(LocalDate date);

       List<Exhibition> findByStartDateGreaterThan(LocalDate now);

       Page<Exhibition> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(
                     LocalDate startDate,
                     LocalDate endDate,
                     Pageable pageable);

       Page<Exhibition> findByStartDateAfter(
                     LocalDate date,
                     Pageable pageable);

       @Query("SELECT e FROM Exhibition e WHERE " +
                     "(:title IS NULL OR e.title LIKE %:title%) AND " +
                     "(:startDate IS NULL OR e.startDate >= :startDate) AND " +
                     "(:endDate IS NULL OR e.endDate <= :endDate)")
       Page<Exhibition> findFiltered(@Param("title") String title,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate,
                     Pageable pageable);
}
