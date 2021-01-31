package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "message_read")
data class MessageRead(
        @Id
        val id: String,
        @Indexed
        val userId: String,
        @Indexed
        val messageId: String,
        @Indexed
        val chatId: String,
        val date: ZonedDateTime
)
