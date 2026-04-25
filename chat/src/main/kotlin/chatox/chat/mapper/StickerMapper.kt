package chatox.chat.mapper

import chatox.chat.api.response.StickerResponse
import chatox.chat.model.Sticker
import org.springframework.stereotype.Component

@Component
class StickerMapper(private val uploadMapper: UploadMapper) {

    fun toStickerResponse(sticker: Sticker) = StickerResponse(
        id = sticker.id,
        stickerPackId = sticker.stickerPackId,
        emojis = sticker.emojis,
        keywords = sticker.keywords,
        upload = uploadMapper.toUploadResponse(sticker.upload)
    )
}
