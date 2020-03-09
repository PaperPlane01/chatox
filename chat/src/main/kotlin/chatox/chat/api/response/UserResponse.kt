package chatox.chat.api.response

import java.util.Date

data class UserResponse(
        val id: String,
        val firstName: String,
        val lastName: String?,
        val slug: String?,
        val avatarUri: String?,
        val deleted: Boolean,
        val bio: String?,
        val lastSeen: Date?,
        val dateOfBirth: Date?
)
