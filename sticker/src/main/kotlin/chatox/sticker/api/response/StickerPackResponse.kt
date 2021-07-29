package chatox.sticker.api.response

import java.time.ZonedDateTime

data class StickerPackResponse<PreviewMetadataType>(
        val id: String,
        val author: String?,
        val createdAt: ZonedDateTime,
        val updatedAt: ZonedDateTime?,
        val name: String,
        val preview: UploadResponse<PreviewMetadataType>,
        val stickers: List<StickerResponse<Any>>,
        val description: String
)
