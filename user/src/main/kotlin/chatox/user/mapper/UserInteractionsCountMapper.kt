package chatox.user.mapper

import chatox.user.api.response.UserInteractionsCountResponse
import chatox.user.domain.UserInteractionsCount
import org.springframework.stereotype.Component

@Component
class UserInteractionsCountMapper {

    fun toUserInteractionsCountResponse(userInteractionsCount: UserInteractionsCount) = UserInteractionsCountResponse(
            likesCount = userInteractionsCount.likesCount,
            dislikesCount = userInteractionsCount.dislikesCount,
            lovesCount = userInteractionsCount.lovesCount
    )
}