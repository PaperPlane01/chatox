package chatox.sticker.mapper

import chatox.sticker.api.response.StickerResponse
import chatox.sticker.model.Sticker
import org.springframework.stereotype.Component

@Component
class StickerMapper(private val uploadMapper: UploadMapper) {

    fun <MetadataType> toStickerResponse(sticker: Sticker<MetadataType>) = StickerResponse<MetadataType>(
            id = sticker.id,
            image = uploadMapper.toUploadResponse(sticker.image),
            stickerPackId = sticker.stickerPackId,
            emojis = sticker.emojis,
            keywords = sticker.keywords
    )
}
