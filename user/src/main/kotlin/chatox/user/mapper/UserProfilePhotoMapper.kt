package chatox.user.mapper

import chatox.user.api.response.UserProfilePhotoResponse
import chatox.user.domain.UserProfilePhoto
import org.springframework.stereotype.Component

@Component
class UserProfilePhotoMapper(private val uploadMapper: UploadMapper) {

    fun toUserProfilePhotoResponse(userProfilePhoto: UserProfilePhoto) = UserProfilePhotoResponse(
            id = userProfilePhoto.id,
            upload = uploadMapper.toUploadResponse(userProfilePhoto.upload)
    )
}