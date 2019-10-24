package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import java.util.Date

@Document(collection = "chatParticipation")
data class ChatParticipation(
        @Id
        var id: String,
        @DBRef
        var chat: Chat,
        @DBRef
        var user: User,
        var createdAt: Date,
        var role: ChatRole,
        @DBRef
        var lastReadMessage: Message?
)
