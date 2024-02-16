package chatox.wallet.repository;

import chatox.wallet.model.Balance;
import chatox.wallet.model.Currency;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BalanceRepository extends JpaRepository<Balance, String> {
    List<Balance> findByUserId(String userId);
    Optional<Balance> findByUserIdAndCurrency(String userId, Currency currency);
    List<Balance> findByUserIdAndCurrencyIn(String userId, List<Currency> currencies);
}
