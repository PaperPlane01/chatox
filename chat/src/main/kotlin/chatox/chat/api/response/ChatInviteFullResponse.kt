package chatox.chat.api.response

import chatox.chat.model.JoinChatAllowance
import chatox.platform.security.VerificationLevel
import java.time.ZonedDateTime

data class ChatInviteFullResponse(
        val id: String,
        val chatId: String,
        val createdAt: ZonedDateTime,
        val createdBy: UserResponse,
        val name: String?,
        val updatedAt: ZonedDateTime?,
        val updatedBy: UserResponse?,
        val user: UserResponse?,
        val active: Boolean,
        val lastUsedAt: ZonedDateTime?,
        val lastUsedBy: UserResponse?,
        val expiresAt: ZonedDateTime?,
        val useTimes: Long,
        val maxUseTimes: Long?,
        val joinAllowanceSettings: Map<VerificationLevel, JoinChatAllowance>?
)
