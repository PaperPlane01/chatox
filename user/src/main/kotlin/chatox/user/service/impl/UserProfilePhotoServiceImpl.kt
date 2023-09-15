package chatox.user.service.impl

import chatox.user.api.request.CreateUserProfilePhotoRequest
import chatox.user.api.request.SetUserProfilePhotoAsAvatarRequest
import chatox.user.api.response.UserProfilePhotoResponse
import chatox.user.cache.UserReactiveRepositoryCacheWrapper
import chatox.user.config.property.UserProfilePhotosConfig
import chatox.user.domain.ImageUploadMetadata
import chatox.user.domain.Upload
import chatox.user.domain.UploadType
import chatox.user.domain.User
import chatox.user.domain.UserProfilePhoto
import chatox.user.exception.UploadNotFoundException
import chatox.user.exception.UserNotFoundException
import chatox.user.exception.UserProfilePhotoNotFoundException
import chatox.user.exception.metadata.UserProfilePhotosLimitReachedException
import chatox.user.mapper.UserProfilePhotoMapper
import chatox.user.messaging.rabbitmq.event.producer.UserProfilePhotoEventsProducer
import chatox.user.repository.UploadRepository
import chatox.user.repository.UserProfilePhotoRepository
import chatox.user.repository.UserRepository
import chatox.user.service.UserAvatarService
import chatox.user.service.UserProfilePhotoService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.slf4j.LoggerFactory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Service
class UserProfilePhotoServiceImpl(
        private val userProfilePhotoRepository: UserProfilePhotoRepository,
        private val uploadRepository: UploadRepository,
        private val userAvatarService: UserAvatarService,
        private val userRepository: UserRepository,
        private val userProfilePhotoMapper: UserProfilePhotoMapper,
        private val userCacheWrapper: UserReactiveRepositoryCacheWrapper,
        private val userProfilePhotoEventsProducer: UserProfilePhotoEventsProducer,
        private val userProfilePhotosConfig: UserProfilePhotosConfig
) : UserProfilePhotoService {
    private val log = LoggerFactory.getLogger(this.javaClass)

    override fun createUserProfilePhoto(
            userId: String,
            createUserProfilePhotoRequest: CreateUserProfilePhotoRequest
    ): Mono<UserProfilePhotoResponse> {
        return mono {
            val user = getUser(userId).awaitFirst()
            val photosCount = userProfilePhotoRepository.countByUserId(userId).awaitFirst()

            if (photosCount == userProfilePhotosConfig.maxProfilePhotos) {
                throw UserProfilePhotosLimitReachedException(userProfilePhotosConfig.maxProfilePhotos)
            }

            val photo = uploadRepository.findByIdAndType<ImageUploadMetadata>(
                    createUserProfilePhotoRequest.uploadId,
                    UploadType.IMAGE
            ).awaitFirstOrNull() ?: throw UploadNotFoundException(
                    "Could not find image with id ${createUserProfilePhotoRequest.uploadId}"
            )

            val userProfilePhoto = UserProfilePhoto(
                    id = ObjectId().toHexString(),
                    userId = userId,
                    upload = photo,
                    createdAt = ZonedDateTime.now()
            )
            userProfilePhotoRepository.save(userProfilePhoto).awaitFirstOrNull()

            if (createUserProfilePhotoRequest.setAsAvatar == true && user.avatar?.id != photo.id) {
                userAvatarService.saveAvatar(
                        user = user,
                        avatar = photo,
                        publishUserUpdatedEvent = true
                )
                        .awaitFirst()
            }

            return@mono userProfilePhotoMapper.toUserProfilePhotoResponse(userProfilePhoto)
        }
    }

    override fun createUserProfilePhoto(user: User, photo: Upload<ImageUploadMetadata>): Mono<UserProfilePhoto> {
        return mono {
            val existingPhoto = userProfilePhotoRepository.findByUserIdAndUploadId(
                    userId = user.id,
                    uploadId = photo.id
            )
                    .awaitFirstOrNull()

            if (existingPhoto != null) {
                return@mono existingPhoto
            }

            val photosCount = userProfilePhotoRepository.countByUserId(user.id).awaitFirst()

            if (photosCount == userProfilePhotosConfig.maxProfilePhotos) {
                throw UserProfilePhotosLimitReachedException(userProfilePhotosConfig.maxProfilePhotos)
            }

            return@mono userProfilePhotoRepository.save(UserProfilePhoto(
                    id = ObjectId().toHexString(),
                    userId = user.id,
                    upload = photo,
                    createdAt = ZonedDateTime.now()
            ))
                    .awaitFirst()
        }
    }

    override fun deleteUserProfilePhoto(userId: String, userProfilePhotoId: String): Mono<Unit> {
        return mono {
            val user = getUser(userId).awaitFirst()
            val userProfilePhoto = userProfilePhotoRepository
                    .findByIdAndUserId(userProfilePhotoId, userId)
                    .awaitFirstOrNull()
                    ?: throw UserProfilePhotoNotFoundException("Could not find user profile photo $userProfilePhotoId")
            userProfilePhotoRepository.delete(userProfilePhoto).awaitFirstOrNull()


            if (user.avatar != null && user.avatar.id == userProfilePhoto.upload.id) {
                userAvatarService.removeAvatar(
                        user = user,
                        publishUserUpdatedEvent = true
                )
                        .awaitFirst()
            }

            Mono.fromRunnable<Unit> {
                userProfilePhotoEventsProducer.userProfilePhotoDeleted(
                        userProfilePhotoMapper.toUserProfilePhotoResponse(userProfilePhoto)
                )
            }
                    .subscribe()

            return@mono
        }
    }

    private fun getUser(userId: String) = userCacheWrapper
            .findById(userId)
            .switchIfEmpty(Mono.error(UserNotFoundException("Could not find user $userId")))

    override fun getUserProfilePhotos(userId: String): Flux<UserProfilePhotoResponse> {
        return userProfilePhotoRepository
                .findByUserId(userId, Sort.by(Sort.Direction.DESC, "createdAt"))
                .map { userProfilePhoto -> userProfilePhotoMapper.toUserProfilePhotoResponse(userProfilePhoto) }
    }

    override fun setUserProfilePhotoAsAvatar(
            userId: String,
            userProfilePhotoId: String,
            setUserProfilePhotoAsAvatarRequest: SetUserProfilePhotoAsAvatarRequest
    ): Mono<Unit> {
        return mono {
            val user = getUser(userId).awaitFirst()
            val userProfilePhoto = userProfilePhotoRepository
                    .findByIdAndUserId(userProfilePhotoId, userId)
                    .awaitFirstOrNull()
                    ?: throw UserProfilePhotoNotFoundException("Could not find user profile photo $userProfilePhotoId")

            if (setUserProfilePhotoAsAvatarRequest.setAsAvatar) {
                if (user.avatar?.id == userProfilePhoto.upload.id) {
                    return@mono
                }

                userAvatarService.saveAvatar(
                        user = user,
                        avatar = userProfilePhoto.upload,
                        publishUserUpdatedEvent = true
                ).awaitFirst()
                return@mono
            } else {
                if (user.avatar?.id == userProfilePhoto.upload.id) {
                    userAvatarService.removeAvatar(
                            user = user,
                            publishUserUpdatedEvent = true
                    )
                            .awaitFirst()
                    return@mono
                }
            }
        }
    }

    @EventListener(ApplicationReadyEvent::class)
    fun createUserProfilePhotosFromAvatars() {
        if (!userProfilePhotosConfig.createPhotosFromAvatarsOnApplicationStart) {
            return
        }

        mono {
            log.info("Creating user profile photos from user's avatars")

            val usersWithAvatars = userRepository.findByAvatarNotNull().collectList().awaitFirst()

            for (user in usersWithAvatars) {
                log.info("Creating user profile photo for user ${user.id}")

                val existingUserProfilePhoto = userProfilePhotoRepository.findByUserIdAndUploadId(
                        userId = user.id,
                        uploadId = user.avatar!!.id
                )
                        .awaitFirstOrNull()

                if (existingUserProfilePhoto != null) {
                    log.info("User ${user.id} already has user profile photo for their avatar")
                    break
                } else {
                    log.info("Creating user profile photo for user ${user.id} and their avatar ${user.avatar.id}")
                    userProfilePhotoRepository.save(UserProfilePhoto(
                            id = ObjectId().toHexString(),
                            userId = user.id,
                            upload = user.avatar,
                            createdAt = ZonedDateTime.now()
                    ))
                            .awaitFirst()
                }
            }
        }
                .subscribe()
    }
}