package almetpt.artspace.config.jwt;

import almetpt.artspace.service.userdetails.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils; // Для проверки строки
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    // Используем имя куки для JWT, определенное в WebSecurityConfig
    @Value("${jwt.cookie-name:jwt-token}")
    private String jwtCookieName;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, CustomUserDetailsService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            // Добавлена проверка jwt на null и пустоту перед валидацией
            if (StringUtils.hasText(jwt) && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.trace("Пользователь {} успешно аутентифицирован через JWT из куки '{}'", username, jwtCookieName);
            } else {
                if (StringUtils.hasText(jwt)) { // Если jwt был, но не прошел валидацию
                    log.trace("JWT токен из куки '{}' не прошел валидацию.", jwtCookieName);
                } else { // Если jwt не был найден
                    log.trace("JWT токен не найден в куках с именем '{}' для пути: {}", jwtCookieName, request.getRequestURI());
                }
            }
        } catch (Exception e) {
            log.error("Не удалось установить аутентификацию пользователя из JWT: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (jwtCookieName.equals(cookie.getName())) {
                    log.trace(
                            "Найдена JWT кука: Name={}, Value (длина)='{}', Path={}, Domain={}, MaxAge={}, HttpOnly={}, Secure={}",
                            cookie.getName(), cookie.getValue().length(), cookie.getPath(), cookie.getDomain(),
                            cookie.getMaxAge(), cookie.isHttpOnly(), cookie.getSecure());
                    return cookie.getValue();
                }
            }
        }
        log.trace("JWT кука с именем '{}' не найдена.", jwtCookieName);
        return null;
    }
}
