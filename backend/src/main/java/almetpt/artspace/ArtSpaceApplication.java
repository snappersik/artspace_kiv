package almetpt.artspace;

import java.util.Arrays;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import almetpt.artspace.model.Role;
import almetpt.artspace.repository.RoleRepository;

@SpringBootApplication
public class ArtSpaceApplication implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;
    
    @Value("${server.port:8080}")
    private String serverPort;
    
    @Value("${server.servlet.context-path:}")
    private String contextPath;

    public static void main(String[] args) {
        SpringApplication.run(ArtSpaceApplication.class, args);
    }

    @Override
    public void run(String... args) {
        // Проверяем существуют ли уже роли
        if (roleRepository.count() == 0) {
            // Создаем базовые роли
            Role adminRole = new Role();
            adminRole.setTitle("ADMIN");
            adminRole.setDescription("Администратор системы");

            Role userRole = new Role();
            userRole.setTitle("USER");
            userRole.setDescription("Обычный пользователь");

            Role artistRole = new Role();
            artistRole.setTitle("ARTIST");
            artistRole.setDescription("Художник");

            // Сохраняем роли
            roleRepository.saveAll(Arrays.asList(adminRole, userRole, artistRole));
        }
        
        // Выводим пути к приложению
        String basePath = "http://localhost:" + serverPort + contextPath;
        System.out.println("Application started successfully!");
        System.out.println("Frontend URL: " + basePath);
        System.out.println("Swagger UI: " + basePath + "/swagger-ui/index.html");
    }
}
