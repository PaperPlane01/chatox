package chatox.chat.messaging.rabbitmq.event

import chatox.chat.api.response.UploadResponse
import chatox.chat.model.ImageUploadMetadata
import java.time.ZonedDateTime

data class ChatUpdated(
        val id: String?,
        val slug: String,
        val name: String,
        val avatarUri: String?,
        val createdAt: ZonedDateTime,
        val description: String?,
        val tags: List<String> = arrayListOf(),
        val avatar: UploadResponse<ImageUploadMetadata>?
)
