package chatox.chat.messaging.rabbitmq.event

import chatox.chat.model.UserAccountRegistrationType
import java.time.ZonedDateTime

data class UserCreated(
        val id: String = "",
        val accountId: String = "",
        val slug: String? = null,
        val bio: String? = null,
        val firstName: String = "",
        val lastName: String? = "",
        val createdAt: ZonedDateTime = ZonedDateTime.now(),
        val lastSeen: ZonedDateTime = ZonedDateTime.now(),
        val avatarUri: String? = null,
        val email: String? = null,
        val anonymous: Boolean,
        val accountRegistrationType: UserAccountRegistrationType,
        val externalAvatarUri: String? = null
)
