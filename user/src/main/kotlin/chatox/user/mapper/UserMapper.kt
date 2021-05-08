package chatox.user.mapper

import chatox.user.api.request.CreateUserRequest
import chatox.user.api.request.UpdateUserRequest
import chatox.user.api.response.UserResponse
import chatox.user.domain.ImageUploadMetadata
import chatox.user.domain.Upload
import chatox.user.domain.User
import org.springframework.stereotype.Component
import java.time.ZonedDateTime

@Component
class UserMapper(private val uploadMapper: UploadMapper) {

    fun toUserResponse(
            user: User,
            online: Boolean = false,
            mapAccountId: Boolean = false,
            mapEmail: Boolean = false,
            mapAccountRegistrationType: Boolean = false
    ) = UserResponse(
            id = user.id,
            slug = user.slug,
            accountId = if (mapAccountId) user.accountId else null,
            lastName = user.lastName,
            firstName = user.firstName,
            bio = user.bio,
            createdAt = user.createdAt,
            lastSeen = user.lastSeen,
            dateOfBirth = user.dateOfBirth,
            online = online,
            email = if (mapEmail) user.email else null,
            avatar = if (user.avatar != null) uploadMapper.toUploadResponse(user.avatar!!) else null,
            anonymous = user.anonymous,
            accountRegistrationType = if (mapAccountRegistrationType) user.accountRegistrationType else null,
            externalAvatarUri = user.externalAvatarUri
    )

    fun fromCreateUserRequest(createUserRequest: CreateUserRequest) = User(
            id = createUserRequest.id,
            firstName = createUserRequest.firstName,
            lastName = createUserRequest.lastName,
            createdAt = ZonedDateTime.now(),
            lastSeen = ZonedDateTime.now(),
            slug = createUserRequest.slug ?: createUserRequest.id,
            accountId = createUserRequest.accountId,
            bio = null,
            deleted = false,
            dateOfBirth = null,
            email = createUserRequest.email,
            avatar = null,
            anonymous = createUserRequest.anonymous,
            externalAvatarUri = createUserRequest.externalAvatarUri,
            accountRegistrationType = createUserRequest.accountRegistrationType
    )

    fun mapUserUpdate(
            originalUser: User,
            updateUserRequest: UpdateUserRequest,
            avatar: Upload<ImageUploadMetadata>?
    ): User = originalUser.copy(
            firstName = updateUserRequest.firstName ?: originalUser.firstName,
            lastName = updateUserRequest.lastName,
            bio = updateUserRequest.bio,
            slug = updateUserRequest.slug,
            dateOfBirth = updateUserRequest.dateOfBirth,
            avatar = avatar
    )
}
