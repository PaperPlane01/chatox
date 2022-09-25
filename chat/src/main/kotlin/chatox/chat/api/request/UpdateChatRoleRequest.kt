package chatox.chat.api.request

import chatox.chat.model.ChatFeatures

data class UpdateChatRoleRequest(
        val name: String,
        val level: Int,
        val features: ChatFeatures
)
