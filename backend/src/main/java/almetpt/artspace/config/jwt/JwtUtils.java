package almetpt.artspace.config.jwt;

import almetpt.artspace.service.userdetails.CustomUserDetails;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtUtils {

    @Value("${jwt.secret:defaultSecretKeyNeedsToBeAtLeast32BytesLongAndVerySecure}") // Убедись, что секрет достаточно длинный и безопасный
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}") // 24 часа в мс
    private int jwtExpirationMs;

    // Это имя куки, в которой будет храниться JWT токен.
    // Оно должно совпадать с тем, что используется в AuthController и JwtAuthenticationFilter.
    @Value("${jwt.cookie-name:jwt-token}")
    private String jwtCookieName; // Это для информации, напрямую здесь не используется, но важно для консистентности

    public String generateJwtToken(Authentication authentication) {
        CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .claim("userId", userPrincipal.getId()) // Добавляем userId в токен
                .claim("roles", userPrincipal.getAuthorities().toString()) // Добавляем роли
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key key() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public Long getUserIdFromJwtToken(String token) { // Метод для извлечения ID пользователя из токена
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("userId", Long.class);
    }


    public boolean validateJwtToken(String authToken) {
        if (authToken == null || authToken.isEmpty()) {
            log.trace("JWT token is null or empty.");
            return false;
        }
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Недействительный JWT токен: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT токен истек: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT токен не поддерживается: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            // Эта ошибка ("JWT strings must contain exactly 2 period characters. Found: 0")
            // будет возникать, если передана не JWT строка (например, ID сессии).
            log.error("JWT claims строка пуста или невалидна: {}", e.getMessage());
        }
        return false;
    }
}
