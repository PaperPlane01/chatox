package chatox.oauth2.respository;

import chatox.oauth2.domain.Role;
import chatox.oauth2.domain.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, String> {
    UserRole findByRole(Role role);
}
