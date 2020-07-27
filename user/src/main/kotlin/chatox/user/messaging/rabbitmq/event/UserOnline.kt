package chatox.user.messaging.rabbitmq.event

import java.time.ZonedDateTime

data class UserOnline(
        val userId: String,
        val lastSeen: ZonedDateTime
)
