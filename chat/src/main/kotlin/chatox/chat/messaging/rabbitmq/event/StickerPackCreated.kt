package chatox.chat.messaging.rabbitmq.event

import chatox.chat.api.response.StickerResponse
import chatox.chat.api.response.UploadResponse
import java.time.ZonedDateTime

data class StickerPackCreated(
        val id: String,
        val name: String,
        val description: String,
        val author: String?,
        val createdAt: ZonedDateTime,
        val updatedAt: ZonedDateTime?,
        val preview: UploadResponse<Any>,
        val stickers: List<StickerResponse<Any>>
)
