package chatox.user.api.request

import javax.validation.constraints.NotBlank

data class CreateUserRequest(
        @NotBlank(message = "ID must be present")
        val id: String,

        @NotBlank(message = "Account ID must be present")
        val accountId: String,

        @NotBlank(message = "First name mist be present")
        val fistName: String,

        val slug: String?,
        val lastName: String?
)
