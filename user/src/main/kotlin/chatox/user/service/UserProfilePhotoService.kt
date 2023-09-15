package chatox.user.service

import chatox.user.api.request.CreateUserProfilePhotoRequest
import chatox.user.api.request.SetUserProfilePhotoAsAvatarRequest
import chatox.user.api.response.UserProfilePhotoResponse
import chatox.user.domain.ImageUploadMetadata
import chatox.user.domain.Upload
import chatox.user.domain.User
import chatox.user.domain.UserProfilePhoto
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface UserProfilePhotoService {
    fun createUserProfilePhoto(
            userId: String,
            createUserProfilePhotoRequest: CreateUserProfilePhotoRequest
    ): Mono<UserProfilePhotoResponse>
    fun createUserProfilePhoto(user: User, photo: Upload<ImageUploadMetadata>): Mono<UserProfilePhoto>

    fun deleteUserProfilePhoto(userId: String, userProfilePhotoId: String): Mono<Unit>
    fun getUserProfilePhotos(userId: String): Flux<UserProfilePhotoResponse>
    fun setUserProfilePhotoAsAvatar(
            userId: String,
            userProfilePhotoId: String,
            setUserProfilePhotoAsAvatarRequest: SetUserProfilePhotoAsAvatarRequest
    ): Mono<Unit>
}