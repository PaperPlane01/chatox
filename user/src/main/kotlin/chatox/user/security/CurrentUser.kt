package chatox.user.security

import java.time.ZonedDateTime

data class CurrentUser(
        val id: String,
        val roles: List<String>,
        val firstName: String,
        val lastName: String?,
        val slug: String?,
        val avatarUri: String?,
        val accountId: String,
        val bio: String?,
        val createdAt: ZonedDateTime,
        val dateOfBirth: ZonedDateTime?
)
