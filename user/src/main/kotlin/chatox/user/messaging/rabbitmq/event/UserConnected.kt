package chatox.user.messaging.rabbitmq.event

data class UserConnected(
        val userId: String,
        val socketIoId: String,
        val ipAddress: String,
        val userAgent: String,
        val accessToken: String
)
