package chatox.user.mapper

import chatox.user.api.response.GlobalBanResponse
import chatox.user.domain.GlobalBan
import org.springframework.stereotype.Component

@Component
class GlobalBanMapper(private val userMapper: UserMapper) {
    fun toGlobalBanResponse(globalBan: GlobalBan): GlobalBanResponse {
        val canceledBy = if (globalBan.cancelledBy != null) {
            userMapper.toUserResponse(globalBan.cancelledBy!!)
        } else null
        val updatedBy = if (globalBan.updatedBy != null) {
            userMapper.toUserResponse(globalBan.updatedBy!!)
        } else null

        return GlobalBanResponse(
                id = globalBan.id,
                createdAt = globalBan.createdAt,
                reason = globalBan.reason,
                comment = globalBan.comment,
                canceled = globalBan.canceled,
                canceledAt = globalBan.canceledAt,
                bannedUser = userMapper.toUserResponse(globalBan.bannedUser),
                createdBy = userMapper.toUserResponse(globalBan.createdBy),
                canceledBy = canceledBy,
                updatedAt = globalBan.updatedAt,
                expiresAt = globalBan.expiresAt,
                permanent = globalBan.permanent,
                updatedBy = updatedBy
        )
    }
}
