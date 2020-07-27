package chatox.user.api.response

import java.time.ZonedDateTime

data class UserSessionResponse(
        val id: String,
        val ipAddress: String?,
        val userAgent: String?,
        val createdAt: ZonedDateTime,
        val disconnectedAt: ZonedDateTime?
)
