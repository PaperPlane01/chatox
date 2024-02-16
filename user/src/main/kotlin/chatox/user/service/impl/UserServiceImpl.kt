package chatox.user.service.impl

import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.user.api.request.CreateUserRequest
import chatox.user.api.request.UpdateUserRequest
import chatox.user.api.response.SlugAvailabilityResponse
import chatox.user.api.response.UserResponse
import chatox.user.cache.UserReactiveRepositoryCacheWrapper
import chatox.user.domain.ImageUploadMetadata
import chatox.user.domain.Upload
import chatox.user.domain.UploadType
import chatox.user.domain.User
import chatox.user.domain.UserProfilePhoto
import chatox.user.exception.UploadNotFoundException
import chatox.user.exception.UserNotFoundException
import chatox.user.mapper.UserMapper
import chatox.user.messaging.rabbitmq.event.producer.UserEventsProducer
import chatox.user.repository.UploadRepository
import chatox.user.repository.UserRepository
import chatox.user.repository.UserSessionRepository
import chatox.user.service.UserProfilePhotoService
import chatox.user.service.UserService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
@Transactional
class UserServiceImpl(private val userRepository: UserRepository,
                      private val userSessionRepository: UserSessionRepository,
                      private val uploadRepository: UploadRepository,
                      private val userProfilePhotoService: UserProfilePhotoService,
                      private val userMapper: UserMapper,
                      private val userEventsProducer: UserEventsProducer,
                      private val authenticationHolder: ReactiveAuthenticationHolder<User>,
                      private val userCacheWrapper: UserReactiveRepositoryCacheWrapper) : UserService {

    override fun deleteUsersByAccount(accountId: String): Flux<Void> {
        return userRepository.findByAccountId(accountId)
                .map { user -> user.copy(deleted = true) }
                .map { user -> userRepository.save(user) }
                .flatMap { Flux.empty<Void>() }
    }

    override fun createUser(createUserRequest: CreateUserRequest): Mono<UserResponse> {
        return mono {
            var user = userRepository.findById(createUserRequest.id).awaitFirstOrNull()

            if (user == null) {
                user = userMapper.fromCreateUserRequest(createUserRequest)
                userRepository.save(user).awaitFirst()
            }

            val userResponse = userMapper.toUserResponse(
                    user = user,
                    mapAccountId = true,
                    mapAccountRegistrationType = true,
                    mapEmail = true
            )
            userEventsProducer.userCreated(userResponse)

            return@mono userResponse
        }
    }

    override fun updateUser(id: String, updateUserRequest: UpdateUserRequest): Mono<UserResponse> {
        return mono {
            if (authenticationHolder.requireCurrentUserDetails().awaitFirst().isBannedGlobally) {
                throw AccessDeniedException("Current user is banned globally")
            }

            var user = findById(id).awaitFirst()
            var avatar: Upload<ImageUploadMetadata>? = null
            var userProfilePhoto: UserProfilePhoto? = null

            if (updateUserRequest.avatarId != null
                    && (user.avatar == null || user.avatar?.id != updateUserRequest.avatarId)) {
                userProfilePhoto = createAvatar(updateUserRequest.avatarId, user).awaitFirst()
                avatar = userProfilePhoto.upload
            }

            user = userMapper.mapUserUpdate(
                    originalUser = user,
                    avatar = avatar,
                    updateUserRequest = updateUserRequest
            )
            user = userRepository.save(user).awaitFirst()

            val online = userSessionRepository.countByUserIdAndDisconnectedAtNull(user.id).awaitFirst() != 0L

            val userResponse = userMapper.toUserResponse(
                    user = user,
                    online = online,
                    mapEmail = true,
                    mapAccountRegistrationType = true,
                    mapAccountId = true
            )
            userEventsProducer.userUpdated(userResponse)

            return@mono userResponse
        }
    }

    private fun createAvatar(uploadId: String, user: User): Mono<UserProfilePhoto> {
        return mono {
            val avatarUpload = uploadRepository.findByIdAndType<ImageUploadMetadata>(uploadId, UploadType.IMAGE)
                    .awaitFirstOrNull()
                    ?: throw UploadNotFoundException(
                            "Could not find image with $uploadId"
                    )

            return@mono userProfilePhotoService.createUserProfilePhoto(user, avatarUpload).awaitFirst()
        }
    }

    override fun deleteUser(id: String): Mono<Void> {
        return findById(id)
                .map { user -> user.copy(deleted = true) }
                .map { user -> userRepository.save(user) }
                .flatMap {
                    userEventsProducer.userDeleted(id)
                    Mono.empty()
                }
    }

    override fun findUserByIdOrSlug(idOrSlug: String): Mono<UserResponse> {
        return mono {
            val user = findByIdOrSlug(idOrSlug).awaitFirst()
            val online = userSessionRepository.countByUserIdAndDisconnectedAtNull(user.id).awaitFirst() != 0L

            userMapper.toUserResponse(
                    user = user,
                    online = online
            )
        }
    }

    override fun findUsersByAccount(accountId: String): Flux<UserResponse> {
        return userRepository.findByAccountId(accountId)
                .map { user -> userMapper.toUserResponse(user) }
    }

    override fun isSlugAvailable(slug: String): Mono<SlugAvailabilityResponse> {
        return userRepository.findBySlug(slug)
                .map { SlugAvailabilityResponse(available = false) }
                .switchIfEmpty(Mono.just(SlugAvailabilityResponse(available = true)))
    }

    override fun updateEmail(accountId: String, email: String): Mono<Void> {
        return mono {
            val users = userRepository
                    .findByAccountId(accountId)
                    .map { user -> user.copy(email = email) }
                    .collectList()
                    .awaitFirst()
            userRepository.saveAll(users).awaitFirst()

            Mono.fromRunnable<Void> {
                users.forEach { user ->
                    userEventsProducer.userUpdated(userMapper.toUserResponse(
                            user = user,
                            mapEmail = true
                    ))
                }
            }
                    .subscribe()

            return@mono Mono.empty<Void>()
        }
                .flatMap { it }
    }

    override fun assertUserExists(id: String): Mono<Unit> {
        return mono {
           userCacheWrapper.findById(
                   id
           ) { id -> UserNotFoundException("Could not find user with id $id") }
                   .awaitFirstOrNull()

            return@mono
        }
    }

    private fun findById(id: String) = userRepository.findById(id)
            .switchIfEmpty(Mono.error(UserNotFoundException("Could not find user with id $id")))

    private fun findByIdOrSlug(idOrSlug: String) = userRepository.findByIdOrSlug(idOrSlug, idOrSlug)
            .switchIfEmpty(Mono.error(UserNotFoundException("Could not find user with id or slug $idOrSlug")))

}
