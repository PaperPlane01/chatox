package chatox.user.api.response

import chatox.user.domain.Currency
import java.math.BigDecimal

data class BalanceResponse(
        val amount: BigDecimal,
        val currency: Currency
)
