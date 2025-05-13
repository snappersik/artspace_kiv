package almetpt.artspace.mapper;

import almetpt.artspace.dto.UserDTO;
import almetpt.artspace.model.GenericModel;
import almetpt.artspace.model.Role; // Import Role
import almetpt.artspace.model.User;
import almetpt.artspace.repository.RoleRepository; // Keep if used elsewhere, not directly here now
import jakarta.annotation.PostConstruct;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class UserMapper extends GenericMapper<User, UserDTO> {

    public UserMapper(ModelMapper mapper, RoleRepository roleRepository) {
        super(User.class, UserDTO.class, mapper);
        // this.roleRepository = roleRepository; // Keep if needed
    }

    @Override
    @PostConstruct
    public void setupMapper() {
        modelMapper.createTypeMap(User.class, UserDTO.class)
                .addMappings(m -> {
                    m.skip(UserDTO::setTicketIds);
                })
                .setPostConverter(toDTOConverter());

        modelMapper.createTypeMap(UserDTO.class, User.class)
                .addMappings(m -> {
                    m.skip(User::setRole);
                    m.skip(User::setTickets); 
                })
                .setPostConverter(toEntityConverter());
    }

    @Override
    protected void mapSpecificFields(UserDTO source, User destination) {
        destination.setTickets(Collections.emptySet()); 
    }

    @Override
    protected void mapSpecificFields(User source, UserDTO destination) {
        if (source != null && source.getRole() != null) {
            Role role = source.getRole();
            destination.setRoleId(role.getId());
            destination.setRoleName(role.getTitle());
        } else {
            destination.setRoleId(null);
            destination.setRoleName(null);
        }
        destination.setTicketIds(getIds(source));
    }

    @Override
    protected List<Long> getIds(User user) {
        return Objects.isNull(user) || Objects.isNull(user.getTickets())
                ? Collections.emptyList() 
                : user.getTickets().stream()
                        .map(GenericModel::getId)
                        .collect(Collectors.toList());
    }
}
