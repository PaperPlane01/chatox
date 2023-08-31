package chatox.user.messaging.rabbitmq.event

data class UserInteractionRolledBack(
        val userInteractionId: String
)
