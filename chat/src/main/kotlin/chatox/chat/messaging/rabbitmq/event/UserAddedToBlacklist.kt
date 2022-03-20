package chatox.chat.messaging.rabbitmq.event

data class UserAddedToBlacklist(
        val userId: String,
        val addedById: String
)