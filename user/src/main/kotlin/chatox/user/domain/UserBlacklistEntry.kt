package chatox.user.domain

import java.time.ZonedDateTime

data class UserBlacklistEntry(
        val userId: String,
        val createdAt: ZonedDateTime
)
