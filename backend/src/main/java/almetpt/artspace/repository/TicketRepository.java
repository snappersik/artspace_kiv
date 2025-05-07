package almetpt.artspace.repository;

import almetpt.artspace.model.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TicketRepository extends GenericRepository<Ticket> {
    List<Ticket> findByUserId(Long userId);
    Page<Ticket> findByExhibitionId(Long exhibitionId, Pageable pageable);
    Page<Ticket> findByPurchaseDate(LocalDate purchaseDate, Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE " +
           "(:userId IS NULL OR t.user.id = :userId) AND " +
           "(:exhibitionId IS NULL OR t.exhibition.id = :exhibitionId) AND " +
           "(:purchaseDate IS NULL OR t.purchaseDate = :purchaseDate)")
    Page<Ticket> findFiltered(@Param("userId") Long userId,
                             @Param("exhibitionId") Long exhibitionId,
                             @Param("purchaseDate") LocalDate purchaseDate,
                             Pageable pageable);
}
