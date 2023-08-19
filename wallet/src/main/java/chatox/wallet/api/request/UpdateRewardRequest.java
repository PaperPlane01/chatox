package chatox.wallet.api.request;

import chatox.platform.validation.annotation.Compare;
import chatox.platform.validation.annotation.ComparisonResult;
import chatox.platform.validation.annotation.RequireAllIfOneNotNull;
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
@RequireAllIfOneNotNull(fields = {"periodStart", "periodEnd"})
@RequireAllIfOneNotNull(fields = {"recurringPeriodUnit", "recurringPeriodValue"})
@Compare(
        field = "periodStart",
        compareWith = "periodEnd",
        expectedResult = ComparisonResult.LESS_THAN_OR_EQUALS
)
@Compare(
        field = "minRewardValue",
        compareWith = "maxRewardValue",
        expectedResult = ComparisonResult.LESS_THAN_OR_EQUALS
)
public class UpdateRewardRequest {
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
    private Integer recurringPeriodValue;
    private boolean active;

    @Size(max = 200)
    private String name;
}
