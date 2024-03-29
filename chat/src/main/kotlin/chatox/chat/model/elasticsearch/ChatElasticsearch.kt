package chatox.chat.model.elasticsearch

import chatox.chat.model.ChatDeletion
import chatox.chat.model.ChatInterface
import chatox.chat.model.ChatType
import chatox.chat.model.DialogDisplay
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.JoinChatAllowance
import chatox.chat.model.SlowMode
import chatox.chat.model.Upload
import chatox.platform.security.VerificationLevel
import org.springframework.data.annotation.Id
import org.springframework.data.elasticsearch.annotations.DateFormat
import org.springframework.data.elasticsearch.annotations.Document
import org.springframework.data.elasticsearch.annotations.Field
import org.springframework.data.elasticsearch.annotations.FieldType
import java.time.ZonedDateTime

@Document(indexName = "chat")
data class ChatElasticsearch(
        @Id
        override val id: String,
        override val name: String,
        override val description: String? = null,
        override val tags: List<String> = arrayListOf(),
        override val avatarUri: String? = null,
        override val avatar: Upload<ImageUploadMetadata>? = null,
        override val slug: String,

        @field:Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        override val createdAt: ZonedDateTime,
        override val createdById: String? = null,

        @field:Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        override val updatedAt: ZonedDateTime? = null,

        @field:Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        override val deletedAt: ZonedDateTime? = null,
        override val deleted: Boolean,
        override val deletedById: String? = null,
        override val type: ChatType,
        override val lastMessageId: String? = null,

        @field:Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        override val lastMessageDate: ZonedDateTime? = null,
        override val lastMessageReadByAnyoneId: String? = null,

        @field:Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        override val lastMessageReadByAnyoneCreatedAt: ZonedDateTime? = null,
        override val chatDeletion: ChatDeletion? = null,

        @field:Field(type = FieldType.Nested)
        override val dialogDisplay: List<DialogDisplay>,

        @field:Field(type = FieldType.Nested)
        override val slowMode: SlowMode? = null, override val joinAllowanceSettings: Map<VerificationLevel, JoinChatAllowance> = mapOf(),
        override val hideFromSearch: Boolean = false
) : ChatInterface
