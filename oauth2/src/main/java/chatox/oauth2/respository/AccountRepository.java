package chatox.oauth2.respository;

import chatox.oauth2.domain.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, String> {
    Account save(Account account);
    Optional<Account> findById(String id);
    Optional<Account> findByUsername(String username);
    Optional<Account> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query(
            value = "select * from account a where a.user_ids@>cast(to_json(:userId) as jsonb)",
            nativeQuery = true
    )
    Account findByUserIdsContains(@Param("userId") String userId);
}
