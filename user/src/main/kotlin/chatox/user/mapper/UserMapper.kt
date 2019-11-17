package chatox.user.mapper

import chatox.user.api.request.CreateUserRequest
import chatox.user.api.request.UpdateUserRequest
import chatox.user.api.response.UserResponse
import chatox.user.domain.User
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.Date

@Component
class UserMapper {
    fun toUserResponse(user: User, mapAccountId: Boolean = false) = UserResponse(
            id = user.id,
            slug = user.slug,
            accountId = if (mapAccountId) user.accountId else null,
            lastName = user.lastName,
            firstName = user.firstName,
            bio = user.bio,
            createdAt = user.createdAt,
            lastSeen = user.lastSeen,
            avatarUri = user.avatarUri
    )

    fun fromCreateUserRequest(createUserRequest: CreateUserRequest) = User(
            id = createUserRequest.id,
            firstName = createUserRequest.firstName,
            lastName = createUserRequest.lastName,
            createdAt = Date.from(Instant.now()),
            lastSeen = Date.from(Instant.now()),
            slug = createUserRequest.slug ?: createUserRequest.id,
            accountId = createUserRequest.accountId,
            avatarUri = null,
            bio = null,
            deleted = false
    )

    fun mapUserUpdate(originalUser: User, updateUserRequest: UpdateUserRequest): User = originalUser.copy(
            firstName = updateUserRequest.firstName ?: originalUser.firstName,
            lastName = updateUserRequest.lastName,
            bio = updateUserRequest.bio,
            avatarUri = updateUserRequest.avatarUri,
            slug = updateUserRequest.slug
    )
}
