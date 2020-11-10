package chatox.chat.messaging.rabbitmq.event

import chatox.chat.model.ChatDeletionReason

data class ChatDeleted(
        val id: String,
        val reason: ChatDeletionReason?,
        val comment: String?
)
