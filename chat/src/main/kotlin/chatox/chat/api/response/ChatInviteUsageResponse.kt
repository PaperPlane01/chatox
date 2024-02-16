package chatox.chat.api.response

import chatox.chat.model.JoinChatRejectionReason

data class ChatInviteUsageResponse(
        val canBeUsed: Boolean,
        val rejectionReason: JoinChatRejectionReason? = null
)

