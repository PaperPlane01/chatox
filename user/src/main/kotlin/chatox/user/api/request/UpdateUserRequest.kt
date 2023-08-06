package chatox.user.api.request

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Past
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.ZonedDateTime

data class UpdateUserRequest(
        @field:NotBlank
        @field:Size(min = 2, max = 20)
        @field:JsonProperty("firstName")
        private val _firstName: String?,

        @field:Size(min = 2, max = 20)
        val lastName: String?,

        @field:Size(max = 10000)
        val bio: String?,
        val avatarId: String?,

        @field:Size(min = 3, max = 30)
        @field:Pattern(regexp = "^[a-zA-Z0-9_.]+\$")
        val slug: String?,

        @field:Past
        val dateOfBirth: ZonedDateTime?
) {
    val firstName: String
        get() = _firstName!!
}
