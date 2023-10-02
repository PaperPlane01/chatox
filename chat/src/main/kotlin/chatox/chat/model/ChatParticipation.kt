package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.elasticsearch.annotations.DateFormat
import org.springframework.data.elasticsearch.annotations.Field
import org.springframework.data.elasticsearch.annotations.FieldType
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class ChatParticipation(
        @Id
        val id: String,

        @Indexed
        val chatId: String,

        val user: User,

        val role: ChatRole? = null,

        @Indexed
        val roleId: String,

        @Indexed
        val lastReadMessageId: String? = null,

        val lastReadMessageAt: ZonedDateTime? = null,

        @Indexed
        val lastReadMessageCreatedAt: ZonedDateTime? = null,

        @Indexed
        val lastMessageReadId: String? = null,

        @field:Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        val createdAt: ZonedDateTime,

        @field:Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        val lastModifiedAt: ZonedDateTime? = null,

        @Indexed
        val lastActiveChatBlockingId: String? = null,
        val userOnline: Boolean = false,
        val deleted: Boolean = false,

        @field:Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        val deletedAt: ZonedDateTime? = null,

        @Indexed
        val deletedById: String? = null,
        val userDisplayedName: String?,
        val userSlug: String?,
        val chatDeleted: Boolean = false
)
