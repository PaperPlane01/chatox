package chatox.sticker.api.response

import chatox.sticker.model.EmojiData
import chatox.sticker.model.StickerUploadMetadata

data class StickerResponse(
    val id: String,
    val stickerPackId: String,
    val keywords: List<String>,
    val emojis: List<EmojiData>,
    val upload: UploadResponse<StickerUploadMetadata>
)
