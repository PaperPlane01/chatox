package chatox.chat.model.elasticsearch

import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
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
        val id: String,
        val text: String,
        val referredMessageId: String? = null,
        val senderId: String,
        val chatId: String,

        @Field(type = FieldType.Date, format = DateFormat.ordinal_date_time)
        val createdAt: ZonedDateTime,

        @Field(type = FieldType.Date, format = DateFormat.ordinal_date_time)
        val updatedAt: ZonedDateTime?,
        val deleted: Boolean,

        @Field(type = FieldType.Date, format = DateFormat.ordinal_date_time)
        val deletedAt: ZonedDateTime?,
        val deletedById: String? = null,
        val uploadAttachmentsIds: List<String> = listOf(),
        val attachments: List<Upload<Any>> = listOf(),
        val emoji: EmojiInfo = EmojiInfo(),
        val pinned: Boolean = false,
        val pinnedById: String? = null,

        @Field(type = FieldType.Date, format = DateFormat.ordinal_date_time)
        val pinnedAt: ZonedDateTime? = null,
        val fromScheduled: Boolean = false,
        val index: Long = 0L,

        val sticker: Sticker<Any>? = null
) {
    fun toMongoDB() = Message(id, text, referredMessageId, senderId, chatId, createdAt, updatedAt, deleted, deletedAt, deletedById, uploadAttachmentsIds, attachments, emoji, pinned, pinnedById, pinnedAt, fromScheduled, index, sticker)
}