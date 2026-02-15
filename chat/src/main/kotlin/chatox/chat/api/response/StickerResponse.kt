package chatox.chat.api.response

import chatox.chat.model.EmojiData
import chatox.chat.model.StickerUploadMetadata

data class StickerResponse(
    val id: String,
    val stickerPackId: String,
    val upload: UploadResponse<StickerUploadMetadata>,
    val keywords: List<String>,
    val emojis: List<EmojiData>
)
