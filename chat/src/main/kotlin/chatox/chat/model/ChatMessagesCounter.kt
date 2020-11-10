package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.DBRef

data class ChatMessagesCounter(
        @Id
        var id: String,

        @DBRef(lazy = true)
        var chat: Chat?,
        var messagesCount: Long
) {
    override fun toString(): String {
        return "ChatMessagesCounter(id='$id', messagesCount=$messagesCount)"
    }
}
