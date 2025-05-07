package almetpt.artspace.dto;

import almetpt.artspace.model.Ticket.TicketStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class TicketDTO extends GenericDTO {
    private Long exhibitionId;
    private String exhibitionTitle;
    private Long userId;
    private String userName;
    private LocalDateTime purchaseDate;
    private LocalDateTime visitDate;
    private BigDecimal price;
    private TicketStatus status;
    private String ticketCode;
}
