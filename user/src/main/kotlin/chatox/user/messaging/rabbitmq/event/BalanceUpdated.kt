package chatox.user.messaging.rabbitmq.event

import chatox.user.domain.Currency
import java.math.BigDecimal

data class BalanceUpdated(
        val userId: String,
        val currency: Currency,
        val amount: BigDecimal
)
