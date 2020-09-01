package chatox.chat.api.request

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.ZonedDateTime
import javax.validation.constraints.Future
import javax.validation.constraints.NotBlank
import javax.validation.constraints.NotNull
import javax.validation.constraints.Past
import javax.validation.constraints.Size

data class CreateChatBlockingRequest(
        @field:NotNull
        @field:Future
        @field:JsonProperty("blockedUntil")
        private val _blockedUntil: ZonedDateTime?,

        @field:NotBlank
        @field:JsonProperty("userId")
        private val _userId: String?,

        @field:Size(max = 2000)
        val description: String?,
        val deleteRecentMessages: Boolean = false,

        @field:Past
        val deleteMessagesSince: ZonedDateTime?
) {
        val blockedUntil: ZonedDateTime
                get() = _blockedUntil!!

        val userId: String
                get() = _userId!!
}
