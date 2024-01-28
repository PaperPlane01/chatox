package chatox.chat.api.response

import chatox.chat.model.JoinChatAllowance
import chatox.platform.security.VerificationLevel

data class ChatInviteResponse(
        val id: String,
        val chat: ChatResponse,
        val joinAllowanceSettings: Map<VerificationLevel, JoinChatAllowance>,
        val usage: ChatInviteUsageResponse
)
