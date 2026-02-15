package chatox.chat.messaging.rabbitmq.event

data class DraftMessageDeleted(
    val chatId: String,
    val draftMessageId: String,
    val senderId: String
)
