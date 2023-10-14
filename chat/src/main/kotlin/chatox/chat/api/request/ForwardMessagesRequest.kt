package chatox.chat.api.request


import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Size

data class ForwardMessagesRequest(
        @field:JsonProperty("forwardedMessagesIds")
        @field:NotEmpty
        @field:Size(max = 100)
        private val _forwardedMessagesIds: List<String>?
) {
    val forwardedMessagesIds: List<String>
        get() = _forwardedMessagesIds!!
}
