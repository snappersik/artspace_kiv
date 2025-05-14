package almetpt.artspace.controllers;

import almetpt.artspace.config.jwt.JwtUtils;
import almetpt.artspace.constants.UserRoleConstants;
import almetpt.artspace.dto.LoginDTO;
import almetpt.artspace.dto.UserDTO;
import almetpt.artspace.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest; // Добавлен импорт
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
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler; // Для logout
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "API для аутентификации и регистрации")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    // Используем имя куки для JWT, определенное в WebSecurityConfig
    @Value("${jwt.cookie-name:jwt-token}")
    private String jwtCookieName;

    // Это значение из jwt.expiration в application.properties (в миллисекундах)
    // JwtUtils использует его для срока действия токена.
    // Для куки MaxAge должен быть в секундах.
    @Value("${jwt.expiration:86400000}") // 24 часа в мс по умолчанию
    private int jwtExpirationMs;

    public AuthController(UserService userService,
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Operation(summary = "Регистрация нового пользователя", description = "Позволяет зарегистрировать нового пользователя в системе")
    @PostMapping(value = "/register", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserDTO> register(@RequestBody UserDTO userDTO) {
        try {
            try {
                UserDTO existingUser = userService.findByLogin(userDTO.getLogin());
                if (existingUser != null) {
                    log.warn("Попытка регистрации пользователя с существующим логином: {}", userDTO.getLogin());
                    return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
                }
            } catch (RuntimeException ignored) {
                // Пользователь не найден, можно продолжать регистрацию
            }

            userDTO.setRoleName(UserRoleConstants.USER);
            userDTO.setRoleId(2L); 
            log.info("Регистрация пользователя {} с ролью: {}, ID роли: {}", userDTO.getLogin(), userDTO.getRoleName(), userDTO.getRoleId());

            UserDTO createdUser = userService.create(userDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            log.error("Ошибка при регистрации пользователя {}: {}", userDTO.getLogin(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400 Bad Request
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
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = jwtUtils.generateJwtToken(authentication);
            log.info("Сгенерирован JWT для пользователя {}: {}", loginRequest.getLogin(), jwt);
            
            Cookie jwtTokenCookie = new Cookie(jwtCookieName, jwt);
            jwtTokenCookie.setPath("/");
            jwtTokenCookie.setHttpOnly(true);
            // jwtExpirationMs измеряется в миллисекундах, MaxAge для Cookie в секундах
            jwtTokenCookie.setMaxAge(jwtExpirationMs / 1000); 
            // jwtTokenCookie.setSecure(true); // Включать для HTTPS в production
            response.addCookie(jwtTokenCookie);

            log.info("Успешный вход пользователя: {}, JWT токен установлен в куки '{}'", loginRequest.getLogin(), jwtCookieName);
            return ResponseEntity.ok().body("Аутентификация успешна");
        } catch (Exception e) {
            log.error("Ошибка аутентификации для {}: {}", loginRequest.getLogin(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Неверный логин или пароль");
        }
    }

    @Operation(summary = "Выход из системы", description = "Завершение сессии пользователя")
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        if (authentication != null) {
             new SecurityContextLogoutHandler().logout(request, response, authentication);
        }
        
        // Удаляем куку с JWT токеном
        Cookie cookie = new Cookie(jwtCookieName, null);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Немедленно удалить куку
        // cookie.setHttpOnly(true); // Также при удалении
        // cookie.setSecure(true);
        response.addCookie(cookie);
        
        log.info("Пользователь {} вышел из системы, JWT кука '{}' удалена.",
                 (authentication != null ? authentication.getName() : "N/A"), jwtCookieName);
        return ResponseEntity.ok().body("Выход выполнен успешно");
    }
}
