package chatox.user.mapper

import chatox.user.api.response.GlobalBanResponse
import chatox.user.domain.GlobalBan
import chatox.user.domain.User
import org.springframework.stereotype.Component

@Component
class GlobalBanMapper(private val userMapper: UserMapper) {
    fun toGlobalBanResponse(
        globalBan: GlobalBan,
        createdBy: User,
        bannedUser: User,
        updatedBy: User?,
        canceledBy: User?
    ): GlobalBanResponse =  GlobalBanResponse(
        id = globalBan.id,
        createdAt = globalBan.createdAt,
        reason = globalBan.reason,
        comment = globalBan.comment,
        canceled = globalBan.canceled,
        canceledAt = globalBan.canceledAt,
        bannedUser = userMapper.toUserResponse(bannedUser),
        createdBy = userMapper.toUserResponse(createdBy),
        canceledBy = canceledBy?.let(userMapper::toUserResponse),
        updatedAt = globalBan.updatedAt,
        expiresAt = globalBan.expiresAt,
        permanent = globalBan.permanent,
        updatedBy = updatedBy?.let(userMapper::toUserResponse),
    )
}
