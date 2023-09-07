package chatox.user.api.response

import chatox.user.domain.UserInteractionType
import java.math.BigDecimal
import java.time.ZonedDateTime

data class UserInteractionResponse(
        val id: String,
        val type: UserInteractionType,
        val user: UserResponse,
        val targetUser: UserResponse,
        val createdAt: ZonedDateTime
)
