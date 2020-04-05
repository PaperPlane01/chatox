package chatox.chat.api.request

import java.time.ZonedDateTime

data class CreateChatBlockingRequest(
        val userId: String,
        val description: String?,
        val blockedUntil: ZonedDateTime
)
