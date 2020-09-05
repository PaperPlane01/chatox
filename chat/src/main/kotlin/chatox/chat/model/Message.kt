package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "message")
data class Message(
        @Id
        var id: String,
        var text: String,

        @DBRef
        var referredMessage: Message?,

        @DBRef
        var sender: User,

        @DBRef(lazy = true)
        val chat: Chat,
        var createdAt: ZonedDateTime,
        var updatedAt: ZonedDateTime?,
        var deleted: Boolean,
        var deletedAt: ZonedDateTime?,

        @DBRef
        var deletedBy: User?,

        @DBRef
        var uploadAttachments: List<ChatUploadAttachment<Any>> = listOf(),
        var emoji: EmojiInfo = EmojiInfo()
)
