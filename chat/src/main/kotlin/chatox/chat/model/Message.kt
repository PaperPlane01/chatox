package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import java.util.Date

@Document(collection = "message")
data class Message(
        @Id
        var id: String,
        var text: String,
        @DBRef
        var referredMessage: Message?,
        @DBRef
        var sender: User,
        @DBRef
        val chat: Chat,
        var createdAt: Date,
        var updatedAt: Date?,
        var deleted: Boolean,
        var deletedAt: Date,
        @DBRef
        var deletedBy: User,
        var attachments: List<MessageAttachment> = arrayListOf()
)
