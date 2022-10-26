package chatox.chat.api.request

import chatox.chat.model.ChatFeatures

data class CreateChatRoleTemplateRequest(
        val name: String,
        val features: ChatFeatures,
        val level: Int
)
