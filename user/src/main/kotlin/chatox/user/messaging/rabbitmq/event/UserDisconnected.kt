package chatox.user.messaging.rabbitmq.event

data class UserDisconnected(
        val userId: String,
        val socketIoId: String
)
