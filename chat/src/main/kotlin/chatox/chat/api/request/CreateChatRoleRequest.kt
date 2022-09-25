package chatox.chat.api.request

import chatox.chat.model.ChatFeatures

data class CreateChatRoleRequest(
        val name: String,
        val features: ChatFeatures,
        val level: Int
)
