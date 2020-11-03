package chatox.chat.messaging.rabbitmq.event

data class ChatParticipationDeleted(
        val userId: String,
        val chatId: String,
        val chatParticipationId: String
)
