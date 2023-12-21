package chatox.chat.api.request

import chatox.chat.support.validation.annotation.StringNotIn
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class CreateChatRequest(
        @field:NotBlank
        @field:Size(max = 30)
        @field:JsonProperty("name")
        private val _name: String?,

        @field:Size(max = 1000)
        val description: String?,

        @field:Size(max = 15)
        val tags: List<@NotBlank @Size(max = 15) String> = arrayListOf(),

        @field:Size(max = 25)
        @field:Pattern(regexp = "^[a-zA-Z0-9_.]+$")
        @field:StringNotIn(["my", "popular", "private", "invites"])
        val slug: String?
) {
        val name: String
                get() = _name!!
}
