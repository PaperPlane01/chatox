package chatox.chat.api.request

import chatox.chat.model.ChatFeatures

data class UpdateChatRoleTemplateRequest(
        val name: String,
        val features: ChatFeatures
)
