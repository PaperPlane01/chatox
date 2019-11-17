package chatox.chat.messaging.rabbitmq.event

import java.time.Instant
import java.util.Date

data class UserCreated(
        val id: String = "",
        val accountId: String = "",
        val slug: String? = null,
        val bio: String? = null,
        val firstName: String = "",
        val lastName: String? = "",
        val createdAt: Date = Date.from(Instant.now()),
        val lastSeen: Date = Date.from(Instant.now()),
        val avatarUri: String? = null
)
