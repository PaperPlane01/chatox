package chatox.chat.model

import chatox.chat.model.elasticsearch.MessageElasticsearch
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class Message(
        @Id
        override val id: String,

        override val text: String,

        @Indexed
        override val referredMessageId: String? = null,

        @Indexed
        override val senderId: String,

        @Indexed
        override val chatId: String,
        override val createdAt: ZonedDateTime,
        override val updatedAt: ZonedDateTime?,
        override val deleted: Boolean,
        override val deletedAt: ZonedDateTime?,

        @Indexed
        override val deletedById: String? = null,

        override val uploadAttachmentsIds: List<String> = listOf(),
        override val attachments: List<Upload<*>> = listOf(),
        override val emoji: EmojiInfo = EmojiInfo(),

        @Indexed
        override val pinned: Boolean = false,
        override val pinnedById: String? = null,
        override val pinnedAt: ZonedDateTime? = null,
        override val fromScheduled: Boolean = false,

        @Indexed
        override val index: Long = 0L,

        override val sticker: Sticker<Any>? = null,
        override val scheduledAt: ZonedDateTime? = null,
        override val chatParticipationId: String
) : MessageInterface {
        fun toElasticsearch() = MessageElasticsearch(id, text, referredMessageId, senderId, chatId, createdAt, updatedAt, deleted, deletedAt, deletedById, uploadAttachmentsIds, attachments, emoji, pinned, pinnedById, pinnedAt, fromScheduled, index, sticker, scheduledAt, chatParticipationId)
}
