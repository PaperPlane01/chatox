package chatox.user.api.response

import chatox.user.domain.UserInteractionType
import java.math.BigDecimal
import java.time.ZonedDateTime

data class UserInteractionCostFullResponse(
        val type: UserInteractionType,
        val cost: BigDecimal,
        val createdAt: ZonedDateTime,
        val createdBy: UserResponse? = null,
        val updatedAt: ZonedDateTime? = null,
        val updatedBy: UserResponse? = null
)