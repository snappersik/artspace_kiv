package almetpt.artspace.repository;

import almetpt.artspace.model.User;
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
}
