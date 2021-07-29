package chatox.sticker.api.response

import chatox.sticker.model.EmojiData

data class StickerResponse<MetadataType>(
        val id: String,
        val stickerPackId: String,
        val keywords: List<String>,
        val emojis: List<EmojiData>,
        val image: UploadResponse<MetadataType>
)
