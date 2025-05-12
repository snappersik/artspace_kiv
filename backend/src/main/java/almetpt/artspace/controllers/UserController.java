package almetpt.artspace.controllers;

import almetpt.artspace.dto.UserDTO;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/users")
@Tag(name = "Users", description = "API для работы с пользователями")
public class UserController extends GenericController<User, UserDTO> {

    private final UserService userService;

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
    public ResponseEntity<UserDTO> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth.getPrincipal() instanceof CustomUserDetails) {
            Long userId = ((CustomUserDetails) auth.getPrincipal()).getId();
            return ResponseEntity.ok(userService.getOne(userId));
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Обновление профиля пользователя", description = "Позволяет пользователю обновить свой профиль")
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@RequestBody UserDTO userDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth.getPrincipal() instanceof CustomUserDetails) {
            Long userId = ((CustomUserDetails) auth.getPrincipal()).getId();
            userDTO.setId(userId); // Перезаписываем ID из аутентификации
            return ResponseEntity.ok(userService.update(userDTO));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @Operation(summary = "Поиск пользователя по логину", description = "Позволяет найти пользователя по логину")
    @GetMapping("/by-login")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> findByLogin(
            @Parameter(description = "Логин пользователя") @RequestParam String login) {

        return ResponseEntity.ok(userService.findByLogin(login));
    }
}
