package chatox.user.mapper

import chatox.user.api.request.CreateUserRequest
import chatox.user.api.request.UpdateUserRequest
import chatox.user.api.response.UserResponse
import chatox.user.domain.User
import org.springframework.stereotype.Component
import java.time.ZonedDateTime

@Component
class UserMapper {
    fun toUserResponse(
            user: User,
            online: Boolean = false,
            mapAccountId: Boolean = false
    ) = UserResponse(
            id = user.id,
            slug = user.slug,
            accountId = if (mapAccountId) user.accountId else null,
            lastName = user.lastName,
            firstName = user.firstName,
            bio = user.bio,
            createdAt = user.createdAt,
            lastSeen = user.lastSeen,
            avatarUri = user.avatarUri,
            dateOfBirth = user.dateOfBirth,
            online = online
    )

    fun fromCreateUserRequest(createUserRequest: CreateUserRequest) = User(
            id = createUserRequest.id,
            firstName = createUserRequest.firstName,
            lastName = createUserRequest.lastName,
            createdAt = ZonedDateTime.now(),
            lastSeen = ZonedDateTime.now(),
            slug = createUserRequest.slug ?: createUserRequest.id,
            accountId = createUserRequest.accountId,
            avatarUri = null,
            bio = null,
            deleted = false,
            dateOfBirth = null
    )

    fun mapUserUpdate(originalUser: User, updateUserRequest: UpdateUserRequest): User = originalUser.copy(
            firstName = updateUserRequest.firstName ?: originalUser.firstName,
            lastName = updateUserRequest.lastName,
            bio = updateUserRequest.bio,
            avatarUri = updateUserRequest.avatarUri,
            slug = updateUserRequest.slug,
            dateOfBirth = updateUserRequest.dateOfBirth
    )
}
