package chatox.wallet.api.response;

import chatox.wallet.model.Currency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RewardClaimResponse {
    private String id;
    private ZonedDateTime createdAt;
    private BigDecimal claimedAmount;
    private Currency currency;
}
