package chatox.user.api.request

import java.time.ZonedDateTime

data class UpdateUserRequest(
        val firstName: String?,
        val lastName: String?,
        val bio: String?,
        val avatarId: String?,
        val slug: String?,
        val dateOfBirth: ZonedDateTime?
)
