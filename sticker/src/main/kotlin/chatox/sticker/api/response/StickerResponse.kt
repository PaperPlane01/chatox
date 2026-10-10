package chatox.sticker.api.response

import chatox.platform.text.api.response.EmojiData
import chatox.sticker.model.StickerUploadMetadata

data class StickerResponse(
    val id: String,
    val stickerPackId: String,
    val keywords: List<String>,
    val emojis: List<EmojiData>,
    val upload: UploadResponse<StickerUploadMetadata>
)
