package chatox.chat.api.response

import chatox.chat.model.EmojiData

data class StickerResponse<MetadataType>(
        val id: String,
        val stickerPackId: String,
        val image: UploadResponse<MetadataType>,
        val keywords: List<String>,
        val emojis: List<EmojiData>
)
