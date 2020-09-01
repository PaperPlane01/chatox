package chatox.chat.api.request

import chatox.chat.support.validation.annotation.StringNotIn
import com.fasterxml.jackson.annotation.JsonProperty
import javax.validation.constraints.NotBlank
import javax.validation.constraints.Pattern
import javax.validation.constraints.Size

data class UpdateChatRequest(
        @field:NotBlank
        @field:Size(max = 30)
        @field:JsonProperty("name")
        private val _name: String?,
        val avatarId: String?,

        @field:Size(max = 25)
        @field:Pattern(regexp = "^[a-zA-Z0-9_.]+$")
        @field:StringNotIn(["my", "popular"])
        val slug: String?,

        @field:Size(max = 1000)
        val description: String?,

        @field:Size(max = 15)
        val tags: List<@NotBlank @Size(max = 15) String>?
) {
        val name: String
                get() = _name!!
}
