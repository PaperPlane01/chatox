package chatox.user.api.request

import chatox.user.domain.UserAccountRegistrationType
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

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
        val email: String?,

        @field:NotNull
        @field:JsonProperty("anonymous")
        private val _anonymous: Boolean?,

        @field:NotNull
        @field:JsonProperty("accountRegistrationType")
        private val _accountRegistrationType: UserAccountRegistrationType?,

        val externalAvatarUri: String?
) {
        val id: String
                get() = _id!!
        val accountId: String
                get() = _accountId!!
        val firstName: String
                get() = _firstName!!
        val anonymous: Boolean
                get() = _anonymous!!
        val accountRegistrationType: UserAccountRegistrationType
                get() = _accountRegistrationType!!
}
