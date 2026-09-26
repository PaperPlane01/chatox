package chatox.chat.messaging.rabbitmq.event

data class MessageReactionDeleted(
    val id: String,
    val messageId: String,
    val chatId: String,
    val emojiId: String,
    val userId: String
)
