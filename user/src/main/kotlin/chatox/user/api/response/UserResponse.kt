package chatox.user.api.response

import com.fasterxml.jackson.annotation.JsonInclude
import java.util.Date

data class UserResponse(
        val id: String,
        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val accountId: String? = null,
        val slug: String?,
        val bio: String?,
        val firstName: String,
        val lastName: String?,
        val createdAt: Date,
        val lastSeen: Date,
        val avatarUri: String?,
        val dateOfBirth: Date?
)
