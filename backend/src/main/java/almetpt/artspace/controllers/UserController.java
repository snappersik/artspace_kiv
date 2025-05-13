package almetpt.artspace.controllers;

import almetpt.artspace.constants.UserRoleConstants;
import almetpt.artspace.dto.UserDTO;
import almetpt.artspace.exception.NotFoundException;
import almetpt.artspace.model.User;
import almetpt.artspace.service.UserService;
import almetpt.artspace.service.userdetails.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<UserDTO>> getAll() {
        return super.getAll();
    }

    @Operation(summary = "Получение профиля пользователя", description = "Возвращает информацию о текущем пользователе")
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getId();
        String userLogin = userDetails.getUsername();

        if (userId.equals(ADMIN_ID_FALLBACK) && ADMIN_USERNAME.equals(userLogin)) {
            UserDTO adminProfile = new UserDTO();
            adminProfile.setId(ADMIN_ID_FALLBACK);
            adminProfile.setLogin(userLogin);
            adminProfile.setFirstName("Admin"); 
            adminProfile.setLastName("Adminov");
            adminProfile.setEmail(userLogin + "@admin.com");
            adminProfile.setRoleName(UserRoleConstants.ADMIN); 
            log.info("Returning profile for in-memory admin: {}", userLogin);
            return ResponseEntity.ok(adminProfile);
        }

        // For regular database users
        try {
            UserDTO userProfile = userService.getOne(userId);
            return ResponseEntity.ok(userProfile);
        } catch (NotFoundException e) {
            log.error("User not found for profile with ID: {}", userId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching profile for user ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
             log.warn("User {} attempting to update profile for user ID {} - forbidden.", userDetails.getUsername(), userDTO.getId());
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
