package chatox.user.api.response

import chatox.user.domain.UserInteractionType
import java.math.BigDecimal

data class UserInteractionCostResponse(
        val type: UserInteractionType,
        val cost: BigDecimal
)
