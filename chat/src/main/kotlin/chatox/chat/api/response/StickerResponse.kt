package chatox.chat.api.response

import chatox.chat.model.StickerUploadMetadata
import chatox.platform.text.api.response.EmojiData

data class StickerResponse(
    val id: String,
    val stickerPackId: String,
    val upload: UploadResponse<StickerUploadMetadata>,
    val keywords: List<String>,
    val emojis: List<EmojiData>
)
