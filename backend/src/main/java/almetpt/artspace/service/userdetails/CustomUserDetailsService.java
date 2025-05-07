package almetpt.artspace.service.userdetails;

import almetpt.artspace.model.User;
import almetpt.artspace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Value("${spring.security.user.name:admin}")
    private String adminUsername;

    @Value("${spring.security.user.password}")
    private String adminPassword;

    @Value("${spring.security.user.roles:ADMIN}")
    private String adminRole;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Проверяем, является ли пользователь админом по умолчанию
        if (adminUsername.equals(username)) {
            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + adminRole));
            return new CustomUserDetails(0L, adminUsername, adminPassword, authorities);
        }

        // Ищем пользователя в базе данных
        User user = userRepository.findByLogin(username)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден: " + username));

        // Создаем список разрешений на основе роли пользователя
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().getTitle()));

        // Возвращаем объект CustomUserDetails с данными пользователя
        return new CustomUserDetails(
                user.getId(),
                user.getLogin(),
                user.getPassword(),
                authorities
        );
    }
}
