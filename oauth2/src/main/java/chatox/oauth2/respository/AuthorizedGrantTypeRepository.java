package chatox.oauth2.respository;

import chatox.oauth2.domain.AuthorizedGrantType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuthorizedGrantTypeRepository extends JpaRepository<AuthorizedGrantType, String> {
    AuthorizedGrantType save(AuthorizedGrantType authorizedGrantType);
    Optional<AuthorizedGrantType> findById(String id);
    Optional<AuthorizedGrantType> findByName(String name);
    List<AuthorizedGrantType> findAll();
    List<AuthorizedGrantType> findAllByName(List<String> names);
}
