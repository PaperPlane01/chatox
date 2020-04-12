package chatox.chat.api.response

import java.time.ZonedDateTime

data class UserResponse(
        val id: String,
        val firstName: String,
        val lastName: String?,
        val slug: String?,
        val avatarUri: String?,
        val deleted: Boolean,
        val bio: String?,
        val lastSeen: ZonedDateTime?,
        val dateOfBirth: ZonedDateTime?,
        val createdAt: ZonedDateTime?
)
