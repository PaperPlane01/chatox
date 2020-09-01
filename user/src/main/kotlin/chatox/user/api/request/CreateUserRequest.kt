package chatox.user.api.request

import com.fasterxml.jackson.annotation.JsonProperty
import javax.validation.constraints.Email
import javax.validation.constraints.NotBlank
import javax.validation.constraints.Pattern
import javax.validation.constraints.Size

data class CreateUserRequest(
        @field:NotBlank
        @field:JsonProperty("id")
        private val _id: String?,

        @field:NotBlank
        @field:JsonProperty("accountId")
        private val _accountId: String?,

        @field:NotBlank
        @field:Size(min = 2, max = 20)
        @field:JsonProperty("firstName")
        private val _firstName: String?,

        @field:Size(min = 3, max = 30)
        @field:Pattern(regexp = "^[a-zA-Z0-9_.]+\$")
        val slug: String?,

        @field:Size(min = 2, max = 20)
        val lastName: String?,

        @field:Email
        val email: String?
) {
        val id: String
                get() = _id!!
        val accountId: String
                get() = _accountId!!
        val firstName: String
                get() = _firstName!!
}
