package chatox.user.messaging.rabbitmq.event

data class UserAddedToBlacklist(
        val userId: String,
        val addedById: String
)
