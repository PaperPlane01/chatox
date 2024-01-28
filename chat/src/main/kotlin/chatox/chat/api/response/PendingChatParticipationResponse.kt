package chatox.chat.api.response

import java.time.ZonedDateTime

data class PendingChatParticipationResponse(
        val id: String,
        val chatId: String,
        val user: UserResponse,
        val createdAt: ZonedDateTime,
        val restoredChatParticipationId: String?
)
