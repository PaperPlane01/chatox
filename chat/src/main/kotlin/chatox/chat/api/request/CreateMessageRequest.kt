package chatox.chat.api.request

import chatox.chat.support.validation.annotation.AllowFieldToBeBlankIfOtherFieldIsNotEmpty
import chatox.chat.support.validation.annotation.StringIn
import com.fasterxml.jackson.annotation.JsonProperty
import javax.validation.constraints.Size

@AllowFieldToBeBlankIfOtherFieldIsNotEmpty(
        checkedField = "_text",
        otherField = "uploadAttachments"
)
data class CreateMessageRequest(
        @field:Size(max = 2000)
        @field:JsonProperty("text")
        private val _text: String?,
        val referredMessageId: String?,

        @field:StringIn(["apple", "facebook", "twitter", "native"])
        val emojisSet: String = "apple",

        @Size(max = 10)
        val uploadAttachments: List<String> = listOf()
) {
        val text: String
                get() = _text!!
}
