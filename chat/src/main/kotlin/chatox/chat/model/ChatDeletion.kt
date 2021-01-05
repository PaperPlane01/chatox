package chatox.chat.model

data class ChatDeletion(
        val id: String,
        val deletionReason: ChatDeletionReason,
        val comment: String?
)
