package chatox.wallet.api.request;

import chatox.wallet.model.Currency;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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
public class CreateRewardRequest {
    @NotNull
    private Currency currency;
    private String userId;

    @Future
    private ZonedDateTime periodStart;

    @Future
    private ZonedDateTime periodEnd;

    @NotNull
    @Positive
    @Max(ValidationConstants.MAX_REWARD_VALUE)
    private BigDecimal minRewardValue;

    @NotNull
    @Positive
    @Max(ValidationConstants.MAX_REWARD_VALUE)
    private BigDecimal maxRewardValue;
    private boolean useIntegersOnly;
    private ChronoUnit recurringPeriodUnit;

    @Positive
    @Max(ValidationConstants.MAX_RECURRING_PERIOD_VALUE)
    private Integer recurringPeriodValue;
    private boolean active;

    @Size(max = 200)
    private String name;
}
