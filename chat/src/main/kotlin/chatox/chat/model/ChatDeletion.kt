package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "chatDeletion")
data class ChatDeletion(
        @Id
        val id: String,
        val deletionReason: ChatDeletionReason,
        val comment: String?
)
