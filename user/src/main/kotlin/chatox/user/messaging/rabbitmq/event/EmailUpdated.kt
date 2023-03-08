package chatox.user.messaging.rabbitmq.event

data class EmailUpdated(
        val accountId: String,
        val email: String
)
