package chatox.sticker.messaging.rabbitmq.event

import chatox.sticker.api.response.StickerResponse

data class StickerPackDeleted(
    val id: String,
    val deleteMessages: Boolean,
    val stickers: List<StickerResponse>
)
