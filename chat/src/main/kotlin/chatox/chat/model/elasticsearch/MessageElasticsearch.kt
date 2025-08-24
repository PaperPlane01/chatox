package chatox.chat.model.elasticsearch

import chatox.chat.model.ChatType
import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
import chatox.chat.model.MessageInterface
import chatox.chat.model.Sticker
import chatox.chat.model.Upload
import org.springframework.data.annotation.Id
import org.springframework.data.elasticsearch.annotations.DateFormat
import org.springframework.data.elasticsearch.annotations.Document
import org.springframework.data.elasticsearch.annotations.Dynamic
import org.springframework.data.elasticsearch.annotations.Field
import org.springframework.data.elasticsearch.annotations.FieldType
import java.time.ZonedDateTime

@Document(indexName = "message", dynamic = Dynamic.FALSE)
data class MessageElasticsearch(
        @Id
        override val id: String,

        @Field(type = FieldType.Text)
        override val text: String,

        @Field(type = FieldType.Keyword)
        override val referredMessageId: String? = null,

        @Field(type = FieldType.Keyword)
        override val senderId: String,

        @Field(type = FieldType.Keyword)
        override val chatId: String,

        @Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        override val createdAt: ZonedDateTime,

        @Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        override val updatedAt: ZonedDateTime?,

        @Field(type = FieldType.Boolean)
        override val deleted: Boolean,

        @Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        override val deletedAt: ZonedDateTime?,

        @Field(type = FieldType.Keyword)
        override val deletedById: String? = null,

        @Field(type = FieldType.Keyword)
        override val uploadAttachmentsIds: List<String> = listOf(),

        @Field(type = FieldType.Object, enabled = false)
        override val attachments: List<Upload<*>> = listOf(),

        @Field(type = FieldType.Object, enabled = false)
        override val emoji: EmojiInfo = EmojiInfo(),

        @Field(type = FieldType.Boolean)
        override val pinned: Boolean = false,

        @Field(type = FieldType.Keyword)
        override val pinnedById: String? = null,

        @Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        override val pinnedAt: ZonedDateTime? = null,

        @Field(type = FieldType.Boolean)
        override val fromScheduled: Boolean = false,

        @Field(type = FieldType.Integer)
        override val index: Long = 0L,

        @Field(type = FieldType.Object, enabled = false)
        override val sticker: Sticker? = null,

        @Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        override val scheduledAt: ZonedDateTime? = null,

        @Field(type = FieldType.Keyword)
        override val chatParticipationId: String,

        @Field(type = FieldType.Keyword)
        override val forwardedFromMessageId: String? = null,

        @Field(type = FieldType.Keyword)
        override val forwardedFromChatId: String? = null,

        @Field(type = FieldType.Keyword)
        override val forwardedFromDialogChatType: ChatType? = null,

        @Field(type = FieldType.Keyword)
        override val forwardedById: String? = null,

        @Field(type = FieldType.Keyword)
        override val chatParticipationIdInSourceChat: String? = null,

        @Field(type = FieldType.Keyword)
        override val mentionedUsers: List<String> = listOf()
) : MessageInterface {
    fun toMongoDB() = Message(
            id,
            text,
            referredMessageId,
            senderId,
            chatId,
            createdAt,
            updatedAt,
            deleted,
            deletedAt,
            deletedById,
            uploadAttachmentsIds,
            attachments,
            emoji,
            pinned,
            pinnedById,
            pinnedAt,
            fromScheduled,
            index,
            sticker,
            scheduledAt,
            chatParticipationId,
            forwardedFromMessageId,
            forwardedFromChatId,
            forwardedFromDialogChatType,
            forwardedById,
            chatParticipationIdInSourceChat
    )
}