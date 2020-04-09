package chatox.chat.model

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "chatParticipation")
data class ChatParticipation(
        @Id
        var id: String? = null,
        @DBRef
        var chat: Chat,
        @DBRef
        var user: User,
        var role: ChatRole,
        @DBRef
        var lastMessageRead: MessageRead?,
        @CreatedDate
        var createdAt: ZonedDateTime? = null,
        @LastModifiedDate
        var lastModifiedAt: ZonedDateTime? = null,

        @DBRef
        var lastChatBlocking: ChatBlocking? = null
)
