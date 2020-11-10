package chatox.chat.messaging.rabbitmq.event

data class UserLeftChat(
        val userId: String,
        val chatId: String,
        val chatParticipationId: String
)
