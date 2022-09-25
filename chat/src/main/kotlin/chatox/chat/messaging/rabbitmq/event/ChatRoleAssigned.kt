package chatox.chat.messaging.rabbitmq.event

import chatox.chat.api.response.ChatRoleResponse

data class ChatRoleAssigned(
        val chatParticipantId: String,
        val chatId: String,
        val role: ChatRoleResponse
)
