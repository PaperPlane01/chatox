package chatox.oauth2.respository;

import chatox.oauth2.domain.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, String> {
    Account save(Account account);
    Optional<Account> findById(String id);
    Optional<Account> findByUsername(String username);
    Optional<Account> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query(
            value = "select * from account where account.user_ids @> :#{#userId}",
            nativeQuery = true
    )
    Account findByUserIdsContains(String userId);
}
