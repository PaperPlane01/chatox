package chatox.user.api.request

import javax.validation.constraints.NotBlank

data class CreateUserRequest(
        @field:NotBlank(message = "ID must be present")
        val id: String,

        @field:NotBlank(message = "Account ID must be present")
        val accountId: String,

        @field:NotBlank(message = "First name mist be present")
        val firstName: String,

        val slug: String?,
        val lastName: String?,
        val email: String?
)
