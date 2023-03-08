package chatox.chat.messaging.rabbitmq.event

data class UserRemovedFromBlacklist(
        val userId: String,
        val removedById: String
)
