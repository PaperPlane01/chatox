package chatox.user.mapper

import chatox.user.api.response.UserSessionResponse
import chatox.user.domain.UserSession
import org.springframework.stereotype.Component

@Component
class UserSessionMapper {
    fun toUserSessionResponse(userSession: UserSession) = UserSessionResponse(
            id = userSession.id,
            ipAddress = userSession.ipAddress,
            createdAt = userSession.createdAt,
            disconnectedAt = userSession.disconnectedAt,
            userAgent = userSession.userAgent
    )
}
