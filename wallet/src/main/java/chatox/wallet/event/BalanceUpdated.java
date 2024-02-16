package chatox.wallet.event;

import chatox.wallet.model.Currency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BalanceUpdated {
    private String userId;
    private Currency currency;
    private BigDecimal amount;
}
