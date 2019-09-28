package chatox.user.api.response

import java.util.Date

data class UserResponse(
        val id: String,
        val slug: String?,
        val bio: String?,
        val firstName: String,
        val lastName: String?,
        val createdAt: Date,
        val lastSeen: Date
)
