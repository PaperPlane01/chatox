package chatox.chat.messaging.rabbitmq.event

import chatox.chat.api.response.StickerResponse
import chatox.chat.api.response.UploadResponse
import java.time.ZonedDateTime

data class StickerPackCreated<PreviewMetadata>(
        val id: String,
        val name: String,
        val description: String,
        val author: String?,
        val createdAt: ZonedDateTime,
        val updatedAt: ZonedDateTime?,
        val preview: UploadResponse<PreviewMetadata>,
        val stickers: List<StickerResponse>
)
