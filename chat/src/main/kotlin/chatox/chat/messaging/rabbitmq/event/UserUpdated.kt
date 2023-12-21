package chatox.chat.messaging.rabbitmq.event

import chatox.chat.api.response.UploadResponse
import chatox.chat.model.ImageUploadMetadata
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
        val dateOfBirth: ZonedDateTime?,
        val avatar: UploadResponse<ImageUploadMetadata>?,
        val anonymous: Boolean,
        val email: String?
)
