package chatox.chat.messaging.rabbitmq.event

import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.api.response.MessageResponse

data class PrivateChatCreated(
        val id: String,
        val chatParticipations: List<ChatParticipationResponse>,
        val message: MessageResponse
)
