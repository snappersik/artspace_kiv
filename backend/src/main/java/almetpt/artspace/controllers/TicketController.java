package almetpt.artspace.controllers;

import almetpt.artspace.dto.TicketDTO;
import almetpt.artspace.model.Ticket;
import almetpt.artspace.service.TicketService;
import almetpt.artspace.service.userdetails.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
@RequestMapping("/tickets")
@Tag(name = "Tickets", description = "API для работы с билетами")
public class TicketController extends GenericController<Ticket, TicketDTO> {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        super(ticketService);
        this.ticketService = ticketService;
    }

    @Operation(summary = "Покупка билета", description = "Позволяет пользователю купить билет на выставку")
    @PostMapping("/purchase")
    public ResponseEntity<TicketDTO> purchaseTicket(
            @RequestBody TicketDTO ticketDTO,
            Authentication authentication) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ticketService.create(ticketDTO));
    }

    @Operation(summary = "Получение билетов текущего пользователя", description = "Возвращает список билетов, приобретенных текущим пользователем")
    @GetMapping("/my")
    public ResponseEntity<List<TicketDTO>> getMyTickets() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth.getPrincipal() instanceof CustomUserDetails) {
            Long userId = ((CustomUserDetails) auth.getPrincipal()).getId();
            return ResponseEntity.ok(ticketService.findByUserId(userId));
        }
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/search/by-exhibition")
    public ResponseEntity<Page<TicketDTO>> findByExhibition(
            @RequestParam Long exhibitionId,
            @Parameter(hidden = true) Pageable pageable) {

        return ResponseEntity.ok(ticketService.findByExhibitionId(exhibitionId, pageable));
    }

}
