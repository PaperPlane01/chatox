package chatox.oauth2.respository;

import chatox.oauth2.domain.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, String> {
    Account save(Account account);
    Optional<Account> findById(String id);
    Optional<Account> findByUsername(String username);
    boolean existsByEmail(String email);
}
