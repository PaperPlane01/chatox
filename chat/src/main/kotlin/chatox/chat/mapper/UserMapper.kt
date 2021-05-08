package chatox.chat.mapper

import chatox.chat.api.response.UserResponse
import chatox.chat.model.User
import org.springframework.stereotype.Component

@Component
class UserMapper(private val uploadMapper: UploadMapper) {
    fun toUserResponse(user: User) = UserResponse(
            id = user.id,
            slug = user.slug,
            avatarUri = user.avatarUri,
            firstName = user.firstName,
            lastName = user.lastName,
            deleted = user.deleted,
            lastSeen = user.lastSeen,
            bio = user.bio,
            dateOfBirth = user.dateOfBirth,
            createdAt = user.createdAt,
            online = user.online,
            avatar = if (user.avatar != null) uploadMapper.toUploadResponse(user.avatar!!) else null,
            anonymous = user.anonymoys,
            externalAvatarUri = user.externalAvatarUri
    )
}
