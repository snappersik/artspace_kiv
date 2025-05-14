package almetpt.artspace.service;

import almetpt.artspace.constants.UserRoleConstants;
import almetpt.artspace.dto.UserDTO;
import almetpt.artspace.dto.UserSearchDTO; // Импорт UserSearchDTO
import almetpt.artspace.mapper.UserMapper;
import almetpt.artspace.model.Role;
import almetpt.artspace.model.User;
import almetpt.artspace.repository.RoleRepository;
import almetpt.artspace.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page; // Импорт Page
import org.springframework.data.domain.Pageable; // Импорт Pageable
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import org.hibernate.Hibernate;

@Slf4j
@Service
public class UserService extends GenericService<User, UserDTO> {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
            RoleRepository roleRepository,
            UserMapper userMapper,
            PasswordEncoder passwordEncoder) {
        super(userRepository, userMapper);
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserDTO create(UserDTO dto) {
        log.info("Создание пользователя с логином: {}", dto.getLogin());
        if (dto.getRoleId() == null) {
            dto.setRoleId(2L); 
            dto.setRoleName(UserRoleConstants.USER);
        }
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            dto.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        User user = userMapper.toEntity(dto);
        if (user.getRole() == null && dto.getRoleId() != null) {
            Role role = roleRepository.findById(dto.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found with id: " + dto.getRoleId()));
            user.setRole(role);
        }
        User savedUser = userRepository.save(user);
        User freshUser = userRepository.findById(savedUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found after saving, id: " + savedUser.getId()));
        return userMapper.toDTO((User) Hibernate.unproxy(freshUser));
    }

    @Override
    @Transactional
    public UserDTO update(UserDTO dto) {
        User user = userRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getId()));
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getLogin() != null) user.setLogin(dto.getLogin());
        if (dto.getAddress() != null) user.setAddress(dto.getAddress());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone()); // Добавлено обновление телефона
        if (dto.getBirthDate() != null) user.setBirthDate(dto.getBirthDate()); // Добавлено обновление даты рождения


        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getRoleId() != null) {
            Role role = roleRepository.findById(dto.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found with id: " + dto.getRoleId()));
            user.setRole(role);
        }
        User updatedUser = userRepository.save(user);
        return userMapper.toDTO((User) Hibernate.unproxy(updatedUser));
    }

    @Transactional(readOnly = true)
    public UserDTO findByLogin(String login) {
        User user = userRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("User not found with login: " + login));
        return userMapper.toDTO((User) Hibernate.unproxy(user));
    }

    @Transactional(readOnly = true)
    public List<UserDTO> findByFullName(String name) {
        List<User> users = userRepository.findByFullNameContaining(name);
        return userMapper.toDTOList(users);
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> search(UserSearchDTO searchDTO, Pageable pageable) {
        Page<User> users = userRepository.findFiltered(
                searchDTO.getLogin(),
                searchDTO.getEmail(),
                searchDTO.getFirstName(),
                searchDTO.getLastName(),
                searchDTO.getRoleName(),
                pageable);
        return users.map(user -> userMapper.toDTO((User) Hibernate.unproxy(user)));
    }
}
