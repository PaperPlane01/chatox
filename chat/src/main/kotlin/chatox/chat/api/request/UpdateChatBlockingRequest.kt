package chatox.chat.api.request

import java.time.ZonedDateTime
import javax.validation.constraints.Future
import javax.validation.constraints.Size

data class UpdateChatBlockingRequest(
        @field:Size(max = 2000)
        val description: String?,

        @field:Future
        val blockedUntil: ZonedDateTime?
)
