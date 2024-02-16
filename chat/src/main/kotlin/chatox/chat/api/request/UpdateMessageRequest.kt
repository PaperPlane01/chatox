package chatox.chat.api.request

import chatox.chat.support.validation.annotation.StringIn
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpdateMessageRequest(
        @field:NotBlank
        @field:Size(max = 2000)
        @field:JsonProperty("text")
        private val _text: String?,

        @field:StringIn(["apple", "facebook", "twitter", "native"])
        val emojisSet: String = "apple",

        @field:Size(max = 10)
        val uploadAttachments: List<String> = listOf()
) {
        val text: String
                get() = _text!!
}
