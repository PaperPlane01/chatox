package chatox.sticker.messaging.rabbitmq.event

import chatox.sticker.api.response.StickerPackResponse
import chatox.sticker.api.response.StickerResponse

data class StickerPackUpdated(
        val stickerPack: StickerPackResponse<*>,
        val newStickers: List<StickerResponse> = listOf(),
        val removedStickers: List<StickerResponse> = listOf()
)
