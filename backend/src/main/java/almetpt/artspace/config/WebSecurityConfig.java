package almetpt.artspace.config;

import almetpt.artspace.config.jwt.JwtAuthenticationFilter;
import almetpt.artspace.service.userdetails.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // Для @PreAuthorize
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy; // Важно
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import static almetpt.artspace.constants.UserRoleConstants.ADMIN;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${spring.mvc.cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${spring.mvc.cors.allowed-methods}")
    private String allowedMethods;

    @Value("${spring.mvc.cors.allowed-headers}")
    private String allowedHeaders;

    @Value("${spring.mvc.cors.allow-credentials:true}")
    private boolean allowCredentials;

    @Value("${server.servlet.session.timeout:3600}") // Используется для maxAge в CORS, не для сессий JWT
    private long maxAge;

    // Это имя куки, которое будет использоваться для JWT токена.
    // Убедись, что оно отличается от server.servlet.session.cookie.name, если ты его задаешь
    // или если Spring по умолчанию создает сессионные куки с тем же именем.
    // В JwtUtils и JwtAuthenticationFilter это имя тоже должно использоваться.
    @Value("${jwt.cookie-name:jwt-token}") // Используем новое имя для JWT куки
    private String jwtCookieName;


    public WebSecurityConfig(CustomUserDetailsService userDetailsService,
                            BCryptPasswordEncoder bCryptPasswordEncoder,
                            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    private final List<String> RESOURCES_WHITE_LIST = List.of(
            "/resources/**",
            "/static/**",
            "/js/**",
            "/css/**",
            "/",
            // "/login", // Это UI путь, API для логина /auth/login
            "/error",
            "/swagger-ui/**",
            "/v3/api-docs/**");

    // API_WHITE_LIST - это публично доступные API эндпоинты, не требующие JWT
    private final List<String> API_WHITE_LIST = List.of(
            "/auth/**", // Регистрация, логин
            // Сделаем просмотр публичным, а создание/редактирование защитим через @PreAuthorize
            "/artworks", "/artworks/getOneById", // Пример: GET /artworks и GET /artworks/getOneById
            "/artists", "/artists/getOneById",
            "/exhibitions", "/exhibitions/getOneById", "/exhibitions/current"
            // /users/** будет защищен по умолчанию, /users/profile требует аутентификации
    );

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(bCryptPasswordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            // Устанавливаем STATELESS режим для API, JWT будет основным механизмом
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(requests -> requests
                .requestMatchers(RESOURCES_WHITE_LIST.toArray(String[]::new)).permitAll()
                .requestMatchers(API_WHITE_LIST.toArray(String[]::new)).permitAll()
                // Все запросы к /admin/** требуют роли ADMIN.
                // @PreAuthorize на контроллерах/методах также будет работать.
                .requestMatchers("/admin/**").hasRole(ADMIN) // Это для примера, если есть /admin в API
                .requestMatchers("/users/getAll", "/users/add", "/users/update", "/users/delete/**").hasRole(ADMIN) // Защищаем CRUD пользователей
                // Остальные запросы требуют аутентификации (т.е. валидного JWT)
                .anyRequest().authenticated()
            )
            // formLogin и httpBasic не нужны при JWT-аутентификации для API
            // .formLogin(form -> form...)
            .logout(logout -> logout
                .logoutUrl("/auth/logout") // Убедись, что этот URL обрабатывается в AuthController
                .logoutSuccessHandler((request, response, authentication) -> SecurityContextHolder.clearContext()) // Просто очищаем контекст
                .deleteCookies(jwtCookieName) // Удаляем нашу JWT куку
                .permitAll()
            )
            .authenticationProvider(authenticationProvider());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList(allowedMethods.split(",")));
        configuration.setAllowedHeaders(Arrays.asList(allowedHeaders.split(",")));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "Set-Cookie"));
        configuration.setAllowCredentials(allowCredentials);
        configuration.setMaxAge(maxAge);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
