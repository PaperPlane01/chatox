package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed

data class ChatMessagesCounter(
        @Id
        var id: String,

        @Indexed
        var chatId: String,
        var messagesCount: Long
)
