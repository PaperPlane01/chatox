package chatox.wallet.api.response;

import chatox.wallet.model.Currency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CurrentUserRewardResponse {
    private String id;
    private Currency currency;
    private ZonedDateTime periodStart;
    private ZonedDateTime periodEnd;
    private Integer recurringPeriodValue;
    private ChronoUnit recurringPeriodUnit;
    private ZonedDateTime lastClaim;
}
