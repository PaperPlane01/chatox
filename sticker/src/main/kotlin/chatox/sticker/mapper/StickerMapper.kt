package chatox.sticker.mapper

import chatox.sticker.api.response.StickerResponse
import chatox.sticker.model.Sticker
import org.springframework.stereotype.Component

@Component
class StickerMapper(private val uploadMapper: UploadMapper) {

    fun toStickerResponse(sticker: Sticker) = StickerResponse(
        id = sticker.id,
        upload = uploadMapper.toUploadResponse(sticker.upload),
        stickerPackId = sticker.stickerPackId,
        emojis = sticker.emojis,
        keywords = sticker.keywords
    )
}
