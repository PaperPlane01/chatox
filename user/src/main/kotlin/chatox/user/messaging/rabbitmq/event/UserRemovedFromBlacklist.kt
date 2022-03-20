package chatox.user.messaging.rabbitmq.event

data class UserRemovedFromBlacklist(
        val userId: String,
        val removedById: String
)
