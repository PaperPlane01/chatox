package chatox.oauth2.respository;

import chatox.oauth2.domain.Scope;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScopeRepository extends JpaRepository<Scope, String> {
    Scope save(Scope scope);
    List<Scope> findAll();
    Optional<Scope> findByName(String name);
    List<Scope> findAllByName(List<String> names);
}
