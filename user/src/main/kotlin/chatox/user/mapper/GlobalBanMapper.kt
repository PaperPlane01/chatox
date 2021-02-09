package chatox.user.mapper

import chatox.user.api.response.GlobalBanResponse
import chatox.user.domain.GlobalBan
import chatox.user.domain.User
import org.springframework.stereotype.Component

@Component
class GlobalBanMapper(private val userMapper: UserMapper) {
    fun toGlobalBanResponse(globalBan: GlobalBan, createdBy: User, bannedUser: User, updatedBy: User?, canceledBy: User?): GlobalBanResponse {
        val canceledByResponse = if (canceledBy != null) {
            userMapper.toUserResponse(canceledBy)
        } else null
        val updatedByResponse = if (updatedBy != null) {
            userMapper.toUserResponse(updatedBy)
        } else null
        val bannedUserResponse = userMapper.toUserResponse(bannedUser)
        val createdByResponse = userMapper.toUserResponse(createdBy)

        return GlobalBanResponse(
                id = globalBan.id,
                createdAt = globalBan.createdAt,
                reason = globalBan.reason,
                comment = globalBan.comment,
                canceled = globalBan.canceled,
                canceledAt = globalBan.canceledAt,
                bannedUser = bannedUserResponse,
                createdBy = createdByResponse,
                canceledBy = canceledByResponse,
                updatedAt = globalBan.updatedAt,
                expiresAt = globalBan.expiresAt,
                permanent = globalBan.permanent,
                updatedBy = updatedByResponse
        )
    }
}
