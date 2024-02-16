package chatox.wallet.api.request;

import chatox.wallet.model.BalanceChangeDirection;
import chatox.wallet.model.Currency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateBalanceChangeRequest {
    @NotNull
    private Currency currency;

    @NotBlank
    private String userId;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    private BalanceChangeDirection direction;
    private String comment;
}
