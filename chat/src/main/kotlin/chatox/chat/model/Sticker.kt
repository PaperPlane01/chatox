package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class Sticker<MetadataType>(
        @Id
        val id: String,
        val image: Upload<MetadataType>,

        @Indexed
        val stickerPackId: String,
        val keywords: List<String>,
        val emojis: List<EmojiData>
)
