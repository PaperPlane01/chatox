package chatox.user.api.request

import chatox.user.domain.UserInteractionType
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Positive
import java.math.BigDecimal

data class UserInteractionCostRequest(
        val type: UserInteractionType,

        @field:Positive
        @field:Max(100000)
        val cost: BigDecimal
)
