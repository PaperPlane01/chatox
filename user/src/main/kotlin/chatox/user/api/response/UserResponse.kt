package chatox.user.api.response

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.ZonedDateTime

data class UserResponse(
        val id: String,
        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val accountId: String? = null,
        val slug: String?,
        val bio: String?,
        val firstName: String,
        val lastName: String?,
        val createdAt: ZonedDateTime,
        val lastSeen: ZonedDateTime,
        val avatarUri: String?,
        val dateOfBirth: ZonedDateTime?,
        val online: Boolean,
        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val email: String? = null
)
