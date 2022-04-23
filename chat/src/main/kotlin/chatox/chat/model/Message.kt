package chatox.chat.model

import chatox.chat.model.elasticsearch.MessageElasticsearch
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class Message(
        @Id
        val id: String,

        val text: String,

        @Indexed
        val referredMessageId: String? = null,

        @Indexed
        val senderId: String,

        @Indexed
        val chatId: String,
        val createdAt: ZonedDateTime,
        val updatedAt: ZonedDateTime?,
        val deleted: Boolean,
        val deletedAt: ZonedDateTime?,

        @Indexed
        val deletedById: String? = null,

        val uploadAttachmentsIds: List<String> = listOf(),
        val attachments: List<Upload<Any>> = listOf(),
        val emoji: EmojiInfo = EmojiInfo(),

        @Indexed
        val pinned: Boolean = false,
        val pinnedById: String? = null,
        val pinnedAt: ZonedDateTime? = null,
        val fromScheduled: Boolean = false,

        @Indexed
        val index: Long = 0L,

        val sticker: Sticker<Any>? = null
) {
        fun toElasticsearch() = MessageElasticsearch(id, text, referredMessageId, senderId, chatId, createdAt, updatedAt, deleted, deletedAt, deletedById, uploadAttachmentsIds, attachments, emoji, pinned, pinnedById, pinnedAt, fromScheduled, index, sticker)
}
