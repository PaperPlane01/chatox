package chatox.user.api.response

import chatox.user.domain.GlobalBanReason
import java.time.ZonedDateTime

data class GlobalBanResponse(
        val id: String,
        val expiresAt: ZonedDateTime?,
        val createdAt: ZonedDateTime,
        val createdBy: UserResponse,
        val bannedUser: UserResponse,
        val canceled: Boolean,
        val canceledAt: ZonedDateTime?,
        val canceledBy: UserResponse?,
        val permanent: Boolean,
        val reason: GlobalBanReason,
        val comment: String?,
        val updatedAt: ZonedDateTime?,
        val updatedBy: UserResponse?
)
