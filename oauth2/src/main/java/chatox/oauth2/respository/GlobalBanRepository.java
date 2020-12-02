package chatox.oauth2.respository;

import chatox.oauth2.domain.Account;
import chatox.oauth2.domain.GlobalBan;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GlobalBanRepository extends JpaRepository<GlobalBan, String> {
    Optional<GlobalBan> findById(String id);

    @Query(
            "select globalBan from GlobalBan globalBan " +
            "where globalBan.bannedAccount = :#{#account} " +
            "and (globalBan.canceled = false or (globalBan.permanent = true or globalBan.expiresAt > current_date))"
    )
    List<GlobalBan> findActiveBansOfAccount(@Param("account") Account account, Pageable pageable);

    default Optional<GlobalBan> findLastActiveBanOfAccount(Account account) {
        var pageRequest = PageRequest.of(
                0,
                1,
                Sort.Direction.DESC,
                "expiresAt"
        );
        var globalBans = findActiveBansOfAccount(account, pageRequest);

        if (globalBans.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(globalBans.get(0));
    }
}
