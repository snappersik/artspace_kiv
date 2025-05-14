package almetpt.artspace.repository;

import almetpt.artspace.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends GenericRepository<User> {
        
    Optional<User> findByLogin(String login);
        
    Optional<User> findByEmail(String email);
        
    @Query("SELECT u FROM User u WHERE " +
           "CONCAT(u.firstName, ' ', u.lastName) LIKE %:fullName%")
    List<User> findByFullNameContaining(@Param("fullName") String fullName);
        
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u " +
           "WHERE (u.login = :login OR u.email = :email)")
    boolean existsByLoginOrEmail(@Param("login") String login, @Param("email") String email);

    @Query("SELECT u FROM User u LEFT JOIN u.role r WHERE " +
           "(:login IS NULL OR lower(u.login) LIKE lower(concat('%', :login, '%'))) AND " +
           "(:email IS NULL OR lower(u.email) LIKE lower(concat('%', :email, '%'))) AND " +
           "(:firstName IS NULL OR lower(u.firstName) LIKE lower(concat('%', :firstName, '%'))) AND " +
           "(:lastName IS NULL OR lower(u.lastName) LIKE lower(concat('%', :lastName, '%'))) AND " +
           "(:roleName IS NULL OR lower(r.title) LIKE lower(concat('%', :roleName, '%')))")
    Page<User> findFiltered(
            @Param("login") String login,
            @Param("email") String email,
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            @Param("roleName") String roleName,
            Pageable pageable);
}
