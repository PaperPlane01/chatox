package chatox.wallet.api.request;

import chatox.wallet.model.Currency;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
    private ZonedDateTime periodStart;
    private ZonedDateTime periodEnd;

    @NotNull
    @Positive
    private BigDecimal minRewardValue;

    @NotNull
    @Positive
    private BigDecimal maxRewardValue;
    private boolean useIntegersOnly;
    private ChronoUnit recurringPeriodUnit;
    private Integer recurringPeriodValue;
}
