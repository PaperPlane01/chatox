package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "chatBlocking")
data class ChatBlocking(
        @Id
        val id: String,
        @DBRef
        val chat: Chat,
        @DBRef
        val blockedUser: User,
        @DBRef
        val blockedBy: User,
        val blockedUntil: ZonedDateTime,
        val description: String?,
        val createdAt: ZonedDateTime,
        val canceled: Boolean,
        val canceledAt: ZonedDateTime?,
        val canceledBy: User?,
        val lastModifiedAt: ZonedDateTime?,
        val lastModifiedBy: User?
)
