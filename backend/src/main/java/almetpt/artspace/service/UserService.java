package almetpt.artspace.service;

import almetpt.artspace.constants.UserRoleConstants;
import almetpt.artspace.dto.UserDTO;
import almetpt.artspace.mapper.UserMapper;
import almetpt.artspace.model.Role;
import almetpt.artspace.model.User;
import almetpt.artspace.repository.RoleRepository;
import almetpt.artspace.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import org.hibernate.Hibernate; // << Import Hibernate

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

        // Устанавливаем роль USER, если не указана
        if (dto.getRoleId() == null) {
            // Явно устанавливаем ID роли USER = 2
            dto.setRoleId(2L); // Assuming USER role ID is 2
            dto.setRoleName(UserRoleConstants.USER);
            log.info("Установлена роль USER с ID: 2");
        }

        // Шифруем пароль
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            dto.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        // Преобразуем DTO в Entity
        User user = userMapper.toEntity(dto);

        if (user.getRole() == null && dto.getRoleId() != null) {
            Role role = roleRepository.findById(dto.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found with id: " + dto.getRoleId()));
            user.setRole(role);
            log.info("Роль установлена вручную: {}", role.getTitle());
        } else if (user.getRole() != null) {
            log.info("Роль была установлена маппером или уже присутствовала: {}", user.getRole().getTitle());
        } else {
            log.warn(
                    "Роль не была установлена для пользователя {}, dto.getRoleId() is null or role could not be found.",
                    dto.getLogin());
        }

        // Сохраняем пользователя
        User savedUser = userRepository.save(user);
        log.info("Пользователь создан с ID: {}", savedUser.getId());

        // Получаем пользователя заново для избежания проблем с прокси при маппинге в
        // DTO
        User freshUser = userRepository.findById(savedUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found after saving, id: " + savedUser.getId()));
        User unproxiedUser = (User) Hibernate.unproxy(freshUser);
        log.info("Unproxied user before mapping to DTO. User ID: {}", unproxiedUser.getId());
        if (unproxiedUser.getRole() != null) {
            log.info("Role on unproxiedUser: {}", unproxiedUser.getRole().getTitle());
        } else {
            log.warn("Role is null on unproxiedUser for User ID: {}", unproxiedUser.getId());
        }

        return userMapper.toDTO(unproxiedUser); // Use the unproxied user
    }

    @Override
    @Transactional
    public UserDTO update(UserDTO dto) {
        User user = userRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getId()));

        // Вручную обновляем поля
        if (dto.getFirstName() != null)
            user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null)
            user.setLastName(dto.getLastName());
        if (dto.getEmail() != null)
            user.setEmail(dto.getEmail());
        if (dto.getLogin() != null)
            user.setLogin(dto.getLogin());
        if (dto.getAddress() != null)
            user.setAddress(dto.getAddress());

        // Шифруем пароль, если он был изменен
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        // Обновляем роль
        if (dto.getRoleId() != null) {
            Role role = roleRepository.findById(dto.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found with id: " + dto.getRoleId()));
            user.setRole(role);
        }

        User updatedUser = userRepository.save(user);
        User unproxiedUser = (User) Hibernate.unproxy(updatedUser);

        return userMapper.toDTO(unproxiedUser);
    }

    @Transactional(readOnly = true)
    public UserDTO findByLogin(String login) {
        User user = userRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("User not found with login: " + login));
        User unproxiedUser = (User) Hibernate.unproxy(user);
        return userMapper.toDTO(unproxiedUser);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> findByFullName(String name) {
        List<User> users = userRepository.findByFullNameContaining(name);
        return userMapper.toDTOList(users);
    }
}
