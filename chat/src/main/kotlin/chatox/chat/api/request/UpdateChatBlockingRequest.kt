package chatox.chat.api.request

import jakarta.validation.constraints.Future
import jakarta.validation.constraints.Size
import java.time.ZonedDateTime

data class UpdateChatBlockingRequest(
        @field:Size(max = 2000)
        val description: String?,

        @field:Future
        val blockedUntil: ZonedDateTime?
)
