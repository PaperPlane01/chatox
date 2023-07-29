package chatox.chat.api.request

import java.time.ZonedDateTime
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.Size

data class UpdateChatBlockingRequest(
        @field:Size(max = 2000)
        val description: String?,

        @field:Future
        val blockedUntil: ZonedDateTime?
)
