package chatox.chat.messaging.rabbitmq.event

data class ChatNotificationsSettingsDeleted(
        val userId: String,
        val chatId: String
)
