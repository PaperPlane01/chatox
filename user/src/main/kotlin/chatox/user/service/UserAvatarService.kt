package chatox.user.service

import chatox.user.domain.ImageUploadMetadata
import chatox.user.domain.Upload
import chatox.user.domain.User
import reactor.core.publisher.Mono

interface UserAvatarService {
    fun saveAvatar(user: User, avatar: Upload<ImageUploadMetadata>, publishUserUpdatedEvent: Boolean): Mono<User>
    fun removeAvatar(user: User, publishUserUpdatedEvent: Boolean): Mono<User>
}