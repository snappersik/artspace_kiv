package almetpt.artspace.mapper;

import almetpt.artspace.dto.UserDTO;
import almetpt.artspace.model.GenericModel;
import almetpt.artspace.model.User;
import jakarta.annotation.PostConstruct;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class UserMapper extends GenericMapper<User, UserDTO> {

    public UserMapper(ModelMapper mapper) {
        super(User.class, UserDTO.class, mapper);
    }

    @Override
    @PostConstruct
    public void setupMapper() {
        modelMapper.createTypeMap(User.class, UserDTO.class)
                .addMappings(m -> {
                    m.map(src -> src.getRole() != null ? src.getRole().getId() : null, UserDTO::setRoleId);
                    m.map(src -> src.getRole() != null ? src.getRole().getTitle() : null, UserDTO::setRoleName);
                    m.skip(UserDTO::setTicketIds);
                })
                .setPostConverter(toDTOConverter());

        modelMapper.createTypeMap(UserDTO.class, User.class)
                .addMappings(m -> {
                    m.skip(User::setRole);
                    m.skip(User::setTickets);
                    m.skip(User::setPassword); // Пароль обрабатывается отдельно
                })
                .setPostConverter(toEntityConverter());
    }

    @Override
    protected void mapSpecificFields(UserDTO source, User destination) {
        // Role и tickets устанавливаются в сервисе
        destination.setTickets(Collections.emptySet());
    }

    @Override
    protected void mapSpecificFields(User source, UserDTO destination) {
        destination.setTicketIds(getIds(source));
    }

    @Override
    protected List<Long> getIds(User user) {
        return Objects.isNull(user) || Objects.isNull(user.getTickets())
                ? null
                : user.getTickets().stream()
                        .map(GenericModel::getId)
                        .collect(Collectors.toList());
    }
}
