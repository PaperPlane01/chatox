package chatox.chat.api.response

import chatox.chat.model.ChatFeatures
import java.time.ZonedDateTime

data class ChatRoleResponse(
        val id: String,
        val name: String,
        val chatId: String,
        val default: Boolean,
        val templateId: String? = null,
        val features: ChatFeatures,
        val createdAt: ZonedDateTime,
        val createdBy: UserResponse? = null,
        val updatedAt: ZonedDateTime? = null,
        val updatedBy: UserResponse? = null,
        val level: Int
)
