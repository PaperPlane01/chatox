package chatox.chat.api.request

import chatox.chat.model.ChatRole

data class UpdateChatParticipationRequest(
        val chatRole: ChatRole
)
