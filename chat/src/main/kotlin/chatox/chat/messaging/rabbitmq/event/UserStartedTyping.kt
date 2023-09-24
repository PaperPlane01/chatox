package chatox.chat.messaging.rabbitmq.event

import chatox.chat.api.response.UserResponse

data class UserStartedTyping(
        val user: UserResponse,
        val chatId: String
)
