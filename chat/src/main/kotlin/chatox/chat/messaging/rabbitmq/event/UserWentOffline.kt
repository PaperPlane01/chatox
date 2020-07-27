package chatox.chat.messaging.rabbitmq.event

import java.time.ZonedDateTime

data class UserWentOffline(
        val userId: String,
        val lastSeen: ZonedDateTime
)
