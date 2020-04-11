package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "message_read")
data class MessageRead(
        @Id
        var id: String,
        @DBRef
        var user: User,
        @DBRef
        var message: Message,
        @DBRef
        var chat: Chat,
        val date: ZonedDateTime
)
