package chatox.chat.api.request

import chatox.chat.support.validation.annotation.StringIn
import com.fasterxml.jackson.annotation.JsonProperty
import javax.validation.constraints.NotBlank
import javax.validation.constraints.Size

data class UpdateMessageRequest(
        @field:NotBlank
        @field:Size(max = 2000)
        @field:JsonProperty("text")
        private val _text: String?,

        @field:StringIn(["apple", "facebook", "twitter", "native"])
        val emojisSet: String = "apple"
) {
        val text: String
                get() = _text!!
}
