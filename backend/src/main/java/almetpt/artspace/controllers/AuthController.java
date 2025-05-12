package almetpt.artspace.controllers;

import almetpt.artspace.constants.UserRoleConstants;
import almetpt.artspace.dto.LoginDTO;
import almetpt.artspace.dto.UserDTO;
import almetpt.artspace.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "API для аутентификации и регистрации")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    
    @Value("${server.servlet.session.cookie.name:jwt}")
    private String cookieName;
    
    @Value("${server.servlet.session.cookie.max-age:3600}")
    private int cookieMaxAge;

    public AuthController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    @Operation(summary = "Регистрация нового пользователя", description = "Позволяет зарегистрировать нового пользователя в системе")
    @PostMapping(value = "/register", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserDTO> register(@RequestBody UserDTO userDTO) {
        try {
            // Проверяем, существует ли пользователь с таким логином
            try {
                UserDTO existingUser = userService.findByLogin(userDTO.getLogin());
                if (existingUser != null) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).build();
                }
            } catch (Exception ignored) {
                // Пользователь не найден, можно продолжать регистрацию
            }
            
            // Устанавливаем роль USER для всех новых пользователей
            userDTO.setRoleName(UserRoleConstants.USER);
            log.info("Регистрация пользователя с ролью: {}", userDTO.getRoleName());
            
            UserDTO createdUser = userService.create(userDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            log.error("Ошибка при регистрации: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @Operation(summary = "Вход в систему", description = "Аутентификация пользователя по логину и паролю")
    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> login(@RequestBody LoginDTO loginRequest, HttpServletResponse response) {
        try {
            log.info("Попытка входа для пользователя: {}", loginRequest.getLogin());
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getLogin(),
                            loginRequest.getPassword()
                    )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Создаем куки для сессии
            Cookie cookie = new Cookie(cookieName, "authenticated");
            cookie.setPath("/");
            cookie.setHttpOnly(true);
            cookie.setMaxAge(cookieMaxAge);
            response.addCookie(cookie);
            
            log.info("Успешный вход пользователя: {}", loginRequest.getLogin());
            return ResponseEntity.ok().body("Аутентификация успешна");
        } catch (Exception e) {
            log.error("Ошибка аутентификации для {}: {}", loginRequest.getLogin(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Неверный логин или пароль");
        }
    }

    @Operation(summary = "Выход из системы", description = "Завершение сессии пользователя")
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) {
        SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
        logoutHandler.logout(request, response, authentication);
        
        // Удаляем куки
        Cookie cookie = new Cookie(cookieName, null);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        
        return ResponseEntity.ok().body("Выход выполнен успешно");
    }
}
