package chatox.chat.messaging.rabbitmq.event

import java.util.Date

data class UserUpdated(
        val id: String,
        val slug: String?,
        val bio: String?,
        val firstName: String,
        val lastName: String?,
        val createdAt: Date,
        val lastSeen: Date,
        val avatarUri: String?
)
