package chatox.chat.api.response

import chatox.chat.model.ChatRole

data class ChatParticipationMinifiedResponse(
        val id: String?,
        val role: ChatRole
)
