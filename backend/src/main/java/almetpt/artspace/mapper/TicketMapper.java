package almetpt.artspace.mapper;

import almetpt.artspace.dto.TicketDTO;
import almetpt.artspace.model.Ticket;
import jakarta.annotation.PostConstruct;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TicketMapper extends GenericMapper<Ticket, TicketDTO> {

    public TicketMapper(ModelMapper mapper) {
        super(Ticket.class, TicketDTO.class, mapper);
    }

    @Override
    @PostConstruct
    public void setupMapper() {
        modelMapper.createTypeMap(Ticket.class, TicketDTO.class)
                .addMappings(m -> {
                    m.map(src -> src.getUser() != null ? src.getUser().getId() : null, TicketDTO::setUserId);
                    m.map(src -> src.getUser() != null ? src.getUser().getFirstName() : null, TicketDTO::setUserName);
                    m.map(src -> src.getExhibition() != null ? src.getExhibition().getId() : null, TicketDTO::setExhibitionId);
                    m.map(src -> src.getExhibition() != null ? src.getExhibition().getTitle() : null, TicketDTO::setExhibitionTitle);
                })
                .setPostConverter(toDTOConverter());

        modelMapper.createTypeMap(TicketDTO.class, Ticket.class)
                .addMappings(m -> {
                    m.skip(Ticket::setUser);
                    m.skip(Ticket::setExhibition);
                })
                .setPostConverter(toEntityConverter());
    }

    @Override
    protected void mapSpecificFields(TicketDTO source, Ticket destination) {
    }

    @Override
    protected void mapSpecificFields(Ticket source, TicketDTO destination) {
    }

    @Override
    protected List<Long> getIds(Ticket ticket) {
        return null;
    }
}
