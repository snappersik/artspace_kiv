package almetpt.artspace.controllers;

import almetpt.artspace.constants.UserRoleConstants;
import almetpt.artspace.dto.UserDTO;
import almetpt.artspace.model.User;
import almetpt.artspace.service.UserService;
import almetpt.artspace.service.userdetails.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/users")
@Tag(name = "Users", description = "API для работы с пользователями")
public class UserController extends GenericController<User, UserDTO> {

    private final UserService userService;

    private static final String ADMIN_USERNAME = "admin";
    private static final Long ADMIN_ID_FALLBACK = 0L;

    public UserController(UserService userService) {
        super(userService);
        this.userService = userService;
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')") // Secure the paginated list
    public ResponseEntity<Page<UserDTO>> getAll(Pageable pageable) {
        return super.getAll(pageable);
    }

    @Operation(summary = "Получение профиля пользователя", description = "Возвращает информацию о текущем пользователе")
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        log.info("Attempting to get user profile.");

        if (authentication == null) {
            log.warn("/users/profile: Authentication is null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Пользователь не аутентифицирован");
        }

        if (!(authentication.getPrincipal() instanceof CustomUserDetails)) {
            log.warn("/users/profile: Principal is not CustomUserDetails. Principal type: {}",
                    authentication.getPrincipal() != null ? authentication.getPrincipal().getClass().getName()
                            : "null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Неверный тип данных пользователя");
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getId();
        String userLogin = userDetails.getUsername();

        log.info("/users/profile: Received request for userId: {}, userLogin: '{}'", userId, userLogin);

        // Проверка для встроенного админа
        if (userId == 0L && "admin".equals(userLogin)) {
            UserDTO adminProfile = new UserDTO();
            adminProfile.setId(0L);
            adminProfile.setLogin(userLogin);
            adminProfile.setFirstName("Admin");
            adminProfile.setLastName("Adminov");
            adminProfile.setEmail("admin@admin.com");
            adminProfile.setRoleName(UserRoleConstants.ADMIN);
            log.info("Returning profile for admin: {}", userLogin);
            return ResponseEntity.ok(adminProfile);
        }

        // Для обычных пользователей из базы данных
        try {
            UserDTO userProfile = userService.getOne(userId);
            log.info("/users/profile: Successfully fetched profile for userId: {}", userId);
            return ResponseEntity.ok(userProfile);
        } catch (Exception e) {
            log.error("/users/profile: Error fetching profile for user ID: {}. Error: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ошибка при получении профиля пользователя");
        }
    }

    @Operation(summary = "Обновление профиля пользователя", description = "Позволяет пользователю обновить свой профиль")
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@RequestBody UserDTO userDTO, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();

        if (!currentUserId.equals(userDTO.getId()) && !ADMIN_USERNAME.equals(userDetails.getUsername())) {
            log.warn("User {} attempting to update profile for user ID {} - forbidden.", userDetails.getUsername(),
                    userDTO.getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (userDTO.getId().equals(ADMIN_ID_FALLBACK) && ADMIN_USERNAME.equals(userDetails.getUsername())) {
            log.info("In-memory admin profile update requested. This is typically not persisted.");
            UserDTO adminProfile = new UserDTO();
            adminProfile.setId(ADMIN_ID_FALLBACK);
            adminProfile.setLogin(ADMIN_USERNAME);
            adminProfile.setFirstName(userDTO.getFirstName() != null ? userDTO.getFirstName() : "Admin");
            adminProfile.setLastName(userDTO.getLastName() != null ? userDTO.getLastName() : "User");
            adminProfile.setEmail(userDTO.getEmail() != null ? userDTO.getEmail() : ADMIN_USERNAME + "@example.com");
            adminProfile.setRoleName(UserRoleConstants.ADMIN);
            return ResponseEntity.ok(adminProfile);
        }

        userDTO.setId(currentUserId);
        return ResponseEntity.ok(userService.update(userDTO));
    }

    @Operation(summary = "Поиск пользователя по логину", description = "Позволяет найти пользователя по логину")
    @GetMapping("/by-login")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> findByLogin(
            @Parameter(description = "Логин пользователя") @RequestParam String login) {

        return ResponseEntity.ok(userService.findByLogin(login));
    }
}
