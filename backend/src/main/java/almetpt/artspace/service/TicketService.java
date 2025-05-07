package almetpt.artspace.service;

import almetpt.artspace.dto.TicketDTO;
import almetpt.artspace.mapper.TicketMapper;
import almetpt.artspace.model.Exhibition;
import almetpt.artspace.model.Ticket;
import almetpt.artspace.model.User;
import almetpt.artspace.repository.ExhibitionRepository;
import almetpt.artspace.repository.TicketRepository;
import almetpt.artspace.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
public class TicketService extends GenericService<Ticket, TicketDTO> {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ExhibitionRepository exhibitionRepository;
    private final TicketMapper ticketMapper;

    public TicketService(TicketRepository ticketRepository,
            UserRepository userRepository,
            ExhibitionRepository exhibitionRepository,
            TicketMapper ticketMapper) {
        super(ticketRepository, ticketMapper);
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.exhibitionRepository = exhibitionRepository;
        this.ticketMapper = ticketMapper;
    }

    @Override
    @Transactional
    public TicketDTO create(TicketDTO dto) {
        Ticket ticket = ticketMapper.toEntity(dto);

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getUserId()));
            ticket.setUser(user);
        }

        if (dto.getExhibitionId() != null) {
            Exhibition exhibition = exhibitionRepository.findById(dto.getExhibitionId())
                    .orElseThrow(() -> new RuntimeException("Exhibition not found with id: " + dto.getExhibitionId()));
            ticket.setExhibition(exhibition);
        }

        return ticketMapper.toDTO(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketDTO update(TicketDTO dto) {
        Ticket ticket = ticketRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + dto.getId()));

        // Вручную обновляем поля
        if (dto.getPurchaseDate() != null)
            ticket.setPurchaseDate(dto.getPurchaseDate());
        if (dto.getPrice() != null)
            ticket.setPrice(dto.getPrice());
        if (dto.getStatus() != null)
            ticket.setStatus(dto.getStatus());

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getUserId()));
            ticket.setUser(user);
        }

        if (dto.getExhibitionId() != null) {
            Exhibition exhibition = exhibitionRepository.findById(dto.getExhibitionId())
                    .orElseThrow(() -> new RuntimeException("Exhibition not found with id: " + dto.getExhibitionId()));
            ticket.setExhibition(exhibition);
        }

        return ticketMapper.toDTO(ticketRepository.save(ticket));
    }

    @Transactional(readOnly = true)
    public List<TicketDTO> findByUserId(Long userId) {
        List<Ticket> tickets = ticketRepository.findByUserId(userId);
        return ticketMapper.toDTOList(tickets);
    }

    @Transactional(readOnly = true)
    public Page<TicketDTO> findByExhibitionId(Long exhibitionId, Pageable pageable) {
        return ticketRepository
                .findByExhibitionId(exhibitionId, pageable)
                .map(ticketMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<TicketDTO> findByPurchaseDate(LocalDate purchaseDate, Pageable pageable) {
        Page<Ticket> tickets = ticketRepository.findByPurchaseDate(purchaseDate, pageable);
        List<TicketDTO> dtos = ticketMapper.toDTOList(tickets.getContent());
        return new PageImpl<>(dtos, pageable, tickets.getTotalElements());
    }
}
