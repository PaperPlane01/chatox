package chatox.chat.api.response

import chatox.chat.model.ChatRole

data class ChatParticipationResponse(
        val id: String?,
        val chatId: String,
        val user: UserResponse,
        val role: ChatRole
)
