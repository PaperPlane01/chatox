package chatox.chat.mapper

import chatox.chat.api.response.UserResponse
import chatox.chat.model.User
import org.springframework.stereotype.Component

@Component
class UserMapper {
    fun toUserResponse(user: User) = UserResponse(
            id = user.id,
            slug = user.slug,
            avatarUri = user.avatarUri,
            firstName = user.firstName,
            lastName = user.lastName,
            deleted = user.deleted
    )
}
