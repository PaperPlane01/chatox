package chatox.user.messaging.rabbitmq.event

import chatox.user.domain.UserInteractionType
import java.math.BigDecimal
import java.time.ZonedDateTime

data class UserInteractionCreated(
        val id: String,
        val type: UserInteractionType,
        val cost: BigDecimal,
        val userId: String,
        val targetUserId: String,
        val createdAt: ZonedDateTime
)