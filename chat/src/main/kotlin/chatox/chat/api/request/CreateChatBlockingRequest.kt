package chatox.chat.api.request

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Past
import jakarta.validation.constraints.Size
import java.time.ZonedDateTime

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
