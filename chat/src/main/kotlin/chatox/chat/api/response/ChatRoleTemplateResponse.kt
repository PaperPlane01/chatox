package chatox.chat.api.response

import chatox.chat.model.ChatFeatures
import java.time.ZonedDateTime

data class ChatRoleTemplateResponse(
        val id: String,
        val name: String,
        val features: ChatFeatures,
        val createdAt: ZonedDateTime,
        val createdBy: UserResponse? = null,
        val updatedAt: ZonedDateTime? = null,
        val updatedBy: UserResponse? = null
)
