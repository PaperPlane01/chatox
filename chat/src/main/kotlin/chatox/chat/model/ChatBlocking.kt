package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import java.util.Date

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
        val blockedUntil: Date,
        val reason: String?,
        val createdAt: Date
)
