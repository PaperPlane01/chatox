package chatox.wallet.api.response;

import chatox.wallet.model.BalanceChangeDataKey;
import chatox.wallet.model.BalanceChangeDirection;
import chatox.wallet.model.BalanceChangeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BalanceChangeResponse {
    private String id;
    private ZonedDateTime date;
    private BigDecimal amount;
    private BalanceChangeType type;
    private BalanceChangeDirection direction;
    private Map<BalanceChangeDataKey, String> metadata;
}
