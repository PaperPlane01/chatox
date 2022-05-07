package chatox.chat.model.elasticsearch

import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
import chatox.chat.model.MessageInterface
import chatox.chat.model.Sticker
import chatox.chat.model.Upload
import org.springframework.data.annotation.Id
import org.springframework.data.elasticsearch.annotations.DateFormat
import org.springframework.data.elasticsearch.annotations.Document
import org.springframework.data.elasticsearch.annotations.Field
import org.springframework.data.elasticsearch.annotations.FieldType
import java.time.ZonedDateTime

@Document(indexName = "message")
data class MessageElasticsearch(
        @Id
        override val id: String,
        override val text: String,
        override val referredMessageId: String? = null,
        override val senderId: String,
        override val chatId: String,

        @Field(type = FieldType.Date, format = DateFormat.ordinal_date_time)
        override val createdAt: ZonedDateTime,

        @Field(type = FieldType.Date, format = DateFormat.ordinal_date_time)
        override val updatedAt: ZonedDateTime?,
        override val deleted: Boolean,

        @Field(type = FieldType.Date, format = DateFormat.ordinal_date_time)
        override val deletedAt: ZonedDateTime?,
        override val deletedById: String? = null,
        override val uploadAttachmentsIds: List<String> = listOf(),
        override val attachments: List<Upload<Any>> = listOf(),
        override val emoji: EmojiInfo = EmojiInfo(),
        override val pinned: Boolean = false,
        override val pinnedById: String? = null,

        @Field(type = FieldType.Date, format = DateFormat.ordinal_date_time)
        override val pinnedAt: ZonedDateTime? = null,
        override val fromScheduled: Boolean = false,
        override val index: Long = 0L,

        override val sticker: Sticker<Any>? = null,
        override val scheduledAt: ZonedDateTime? = null
) : MessageInterface {
    fun toMongoDB() = Message(id, text, referredMessageId, senderId, chatId, createdAt, updatedAt, deleted, deletedAt, deletedById, uploadAttachmentsIds, attachments, emoji, pinned, pinnedById, pinnedAt, fromScheduled, index, sticker)
}