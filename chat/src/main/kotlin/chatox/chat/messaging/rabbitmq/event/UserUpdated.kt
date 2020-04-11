package chatox.chat.messaging.rabbitmq.event

import java.time.ZonedDateTime
import java.util.Date

data class UserUpdated(
        val id: String,
        val slug: String?,
        val bio: String?,
        val firstName: String,
        val lastName: String?,
        val createdAt: ZonedDateTime,
        val lastSeen: ZonedDateTime,
        val avatarUri: String?,
        val dateOfBirth: ZonedDateTime?
)
