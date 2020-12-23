package chatox.user.security

import java.time.ZonedDateTime

data class JwtGlobalBanInfo(
        val id: String,
        val expiresAt: ZonedDateTime?,
        val permanent: Boolean = false
)
