package chatox.chat.messaging.rabbitmq.event

import chatox.chat.api.response.StickerResponse

data class StickerPackUpdated(
        val stickerPack: StickerPackCreated<*>,
        val newStickers: List<StickerResponse>,
        val removedStickers: List<StickerResponse>
)
