package chatox.sticker.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class Sticker<MetadataType>(
        @Id
        val id: String,

        @Indexed
        val stickerPackId: String,
        val image: Upload<MetadataType>,
        val keywords: List<String>,
        val emojis: List<EmojiData>,
        val createdAt: ZonedDateTime
)
