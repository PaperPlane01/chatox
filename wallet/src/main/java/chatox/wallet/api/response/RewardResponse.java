package chatox.wallet.api.response;

import chatox.wallet.model.Currency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RewardResponse {
    private String id;
    private UserResponse createdBy;
    private UserResponse updatedBy;
    private UserResponse rewardedUser;
    private Currency currency;
    private ZonedDateTime createdAt;
    private ZonedDateTime periodStart;
    private ZonedDateTime periodEnd;
    private BigDecimal minRewardValue;
    private BigDecimal maxRewardValue;
    private boolean useIntegersOnly;
    private ChronoUnit recurringPeriodUnit;
    private Integer recurringPeriodValue;
    private boolean active;
}
