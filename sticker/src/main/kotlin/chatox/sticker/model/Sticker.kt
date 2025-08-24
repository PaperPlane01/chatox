package chatox.sticker.model

import chatox.sticker.api.request.UpdateStickerRequest
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class Sticker(
        @Id
        val id: String,

        @Indexed
        val stickerPackId: String,
        val upload: Upload<StickerUploadMetadata>,
        val keywords: List<String>,
        val emojis: List<EmojiData>,
        val createdAt: ZonedDateTime,
        val updatedAt: ZonedDateTime? = null
) {
        fun equalsTo(updateStickerRequest: UpdateStickerRequest): Boolean {
                return updateStickerRequest.keywords == this.keywords
                        && updateStickerRequest.emojis == this.emojis.map { emoji -> emoji.id }
        }
}
