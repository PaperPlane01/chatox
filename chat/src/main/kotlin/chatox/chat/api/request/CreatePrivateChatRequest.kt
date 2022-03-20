package chatox.chat.api.request

import com.fasterxml.jackson.annotation.JsonProperty
import javax.validation.constraints.NotNull

data class CreatePrivateChatRequest(
        @field:NotNull
        @field:JsonProperty("userId")
        private val _userId: String?,

        @field:NotNull
        @field:JsonProperty("message")
        private val _message: CreateMessageRequest?
) {
    val userId: String
        get() = _userId!!

    val message: CreateMessageRequest
        get() = _message!!
}
