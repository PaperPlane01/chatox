package chatox.wallet.api.response;

import chatox.wallet.model.Currency;
import com.fasterxml.jackson.annotation.JsonInclude;
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

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private UserResponse createdBy;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private UserResponse updatedBy;
    private UserResponse rewardedUser;
    private Currency currency;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private ZonedDateTime createdAt;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private ZonedDateTime updatedAt;
    private ZonedDateTime periodStart;
    private ZonedDateTime periodEnd;
    private BigDecimal minRewardValue;
    private BigDecimal maxRewardValue;
    private boolean useIntegersOnly;
    private ChronoUnit recurringPeriodUnit;
    private Integer recurringPeriodValue;
    private boolean active;
    private String name;
}
