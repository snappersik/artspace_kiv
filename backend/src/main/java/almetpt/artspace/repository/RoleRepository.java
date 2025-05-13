package almetpt.artspace.repository;

import almetpt.artspace.model.Role;

import java.util.Optional;

import org.springframework.stereotype.Repository;


@Repository
public interface RoleRepository extends GenericRepository<Role> {
    Optional<Role> findByTitle(String title);
}
