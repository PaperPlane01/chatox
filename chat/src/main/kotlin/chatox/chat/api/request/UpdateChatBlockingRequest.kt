package chatox.chat.api.request

import java.time.ZonedDateTime

data class UpdateChatBlockingRequest(
        val description: String?,
        val blockedUntil: ZonedDateTime?
)
