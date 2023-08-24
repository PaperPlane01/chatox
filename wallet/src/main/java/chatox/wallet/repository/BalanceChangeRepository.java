package chatox.wallet.repository;

import chatox.wallet.model.Balance;
import chatox.wallet.model.BalanceChange;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BalanceChangeRepository extends JpaRepository<BalanceChange, String> {
    List<BalanceChange> findByBalance(Balance balance, Pageable pageable);
}
