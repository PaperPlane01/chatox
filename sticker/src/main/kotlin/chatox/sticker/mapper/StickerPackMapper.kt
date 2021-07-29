package chatox.sticker.mapper

import chatox.sticker.api.response.StickerPackResponse
import chatox.sticker.model.Sticker
import chatox.sticker.model.StickerPack
import org.springframework.stereotype.Component

@Component
class StickerPackMapper(private val stickerMapper: StickerMapper,
                        private val uploadMapper: UploadMapper) {

    fun <PreviewMetadataType> toStickerPackResponse(
            stickerPack: StickerPack<PreviewMetadataType>,
            stickers: List<Sticker<Any>>
    ) = StickerPackResponse(
            id = stickerPack.id,
            createdAt = stickerPack.createdAt,
            updatedAt = stickerPack.updatedAt,
            author = stickerPack.author,
            stickers = stickers.map { sticker -> stickerMapper.toStickerResponse(sticker) },
            name = stickerPack.name,
            description = stickerPack.description,
            preview = uploadMapper.toUploadResponse(stickerPack.preview)
    )
}
