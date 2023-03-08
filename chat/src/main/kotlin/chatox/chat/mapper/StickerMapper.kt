package chatox.chat.mapper

import chatox.chat.api.response.StickerResponse
import chatox.chat.model.Sticker
import org.springframework.stereotype.Component

@Component
class StickerMapper(private val uploadMapper: UploadMapper) {

    fun <MetadataType> toStickerResponse(sticker: Sticker<MetadataType>) = StickerResponse(
            id = sticker.id,
            stickerPackId = sticker.stickerPackId,
            emojis = sticker.emojis,
            keywords = sticker.keywords,
            image = uploadMapper.toUploadResponse(sticker.image)
    )
}
