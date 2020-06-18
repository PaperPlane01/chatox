package chatox.user.messaging.rabbitmq.event

import java.time.ZonedDateTime

data class UserOffline(
        val userId: String,
        val lastSeen: ZonedDateTime
)
