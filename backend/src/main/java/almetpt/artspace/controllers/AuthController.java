package almetpt.artspace.controllers;

import almetpt.artspace.constants.UserRoleConstants;
import almetpt.artspace.dto.LoginDTO;
import almetpt.artspace.dto.UserDTO;
import almetpt.artspace.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "API для аутентификации и регистрации")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    @Operation(summary = "Регистрация нового пользователя", description = "Позволяет зарегистрировать нового пользователя в системе")
    @PostMapping(value = "/register", 
                produces = MediaType.APPLICATION_JSON_VALUE, 
                consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserDTO> register(@RequestBody UserDTO userDTO) {
        // Устанавливаем роль USER для всех новых пользователей
        userDTO.setRoleName(UserRoleConstants.USER);
        
        UserDTO createdUser = userService.create(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @Operation(summary = "Вход в систему", description = "Аутентификация пользователя по логину и паролю")
    @PostMapping(value = "/login", 
                produces = MediaType.APPLICATION_JSON_VALUE, 
                consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@RequestBody LoginDTO loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(), 
                    loginRequest.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
           
            return ResponseEntity.ok().body("Аутентификация успешна");
        } catch (Exception e) {
            log.error("Ошибка аутентификации: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Неверный логин или пароль");
        }
    }
}
