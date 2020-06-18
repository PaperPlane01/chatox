package chatox.chat.messaging.rabbitmq.event

import java.time.ZonedDateTime

data class UserWentOnline(
        val userId: String,
        val lastSeen: ZonedDateTime
)
