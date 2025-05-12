package almetpt.artspace.service;

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
        User user = userMapper.toEntity(dto);
        
        // Шифруем пароль
        if (dto.getPassword() != null) {
            String encodedPassword = passwordEncoder.encode(dto.getPassword());
            log.debug("Пароль зашифрован");
            user.setPassword(encodedPassword);
        }
        
        // Устанавливаем роль
        if (dto.getRoleId() != null) {
            log.info("Установка роли по ID: {}", dto.getRoleId());
            Role role = roleRepository.findById(dto.getRoleId())
                    .orElseThrow(() -> {
                        log.error("Роль не найдена по ID: {}", dto.getRoleId());
                        return new RuntimeException("Role not found with id: " + dto.getRoleId());
                    });
            user.setRole(role);
            log.info("Роль установлена по ID: {}", role.getTitle());
        } else {
            // Если роль не указана, устанавливаем роль USER по умолчанию
            log.info("Роль не указана, устанавливаем USER по умолчанию (ID: 2)");
            // Предполагаем, что роль USER имеет ID 2
            Role defaultRole = roleRepository.findById(2L)
                    .orElseThrow(() -> {
                        log.error("Роль по умолчанию не найдена по ID: 2");
                        return new RuntimeException("Default role not found with ID: 2");
                    });
            user.setRole(defaultRole);
            log.info("Роль по умолчанию установлена: {}", defaultRole.getTitle());
        }
        
        User savedUser = userRepository.save(user);
        log.info("Пользователь создан с ID: {} и ролью: {}", savedUser.getId(), savedUser.getRole().getTitle());
        return userMapper.toDTO(savedUser);
    }

    @Override
    @Transactional
    public UserDTO update(UserDTO dto) {
        User user = userRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getId()));
        
        // Вручную обновляем поля
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getLogin() != null) user.setLogin(dto.getLogin());
        if (dto.getAddress() != null) user.setAddress(dto.getAddress());
        
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
        
        return userMapper.toDTO(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserDTO findByLogin(String login) {
        User user = userRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("User not found with login: " + login));
        return userMapper.toDTO(user);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> findByFullName(String name) {
        List<User> users = userRepository.findByFullNameContaining(name);
        return userMapper.toDTOList(users);
    }
}
