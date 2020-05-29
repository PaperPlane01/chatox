package chatox.user.service.impl

import chatox.user.api.request.CreateUserRequest
import chatox.user.api.request.UpdateUserRequest
import chatox.user.api.response.SlugAvailabilityResponse
import chatox.user.api.response.UserResponse
import chatox.user.exception.UserNotFoundException
import chatox.user.mapper.UserMapper
import chatox.user.messaging.rabbitmq.event.producer.UserEventsProducer
import chatox.user.repository.UserRepository
import chatox.user.repository.UserSessionRepository
import chatox.user.service.UserService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
@Transactional
class UserServiceImpl(private val userRepository: UserRepository,
                      private val userSessionRepository: UserSessionRepository,
                      private val userMapper: UserMapper,
                      private val userEventsProducer: UserEventsProducer) : UserService {

    override fun deleteUsersByAccount(accountId: String): Flux<Void> {
        return userRepository.findByAccountId(accountId)
                .map { user -> user.copy(deleted = true) }
                .map { user -> userRepository.save(user) }
                .flatMap { Flux.empty<Void>() }
    }

    override fun createUser(createUserRequest: CreateUserRequest): Mono<UserResponse> {
        val user = userMapper.fromCreateUserRequest(createUserRequest)

        return userRepository.save(user)
                .map { userMapper.toUserResponse(it, mapAccountId = true) }
                .map {
                    userEventsProducer.userCreated(it)
                    it.copy(accountId = null)
                }
    }

    override fun updateUser(id: String, updateUserRequest: UpdateUserRequest): Mono<UserResponse> {
        return mono {
            var user = findById(id).awaitFirst()
            user = userMapper.mapUserUpdate(user, updateUserRequest)
            user = userRepository.save(user).awaitFirst()
            val online = userSessionRepository.countByUserAndDisconnectedAtNull(user).awaitFirst() != 0L

            val userResponse = userMapper.toUserResponse(
                    user = user,
                    online = online
            )
            userEventsProducer.userUpdated(userResponse)
            userResponse
        }
    }

    override fun deleteUser(id: String): Mono<Void> {
        return findById(id)
                .map { user -> user.copy(deleted = true) }
                .map { user -> userRepository.save(user) }
                .flatMap {
                    userEventsProducer.userDeleted(id)
                    Mono.empty<Void>()
                }
    }

    override fun findUserByIdOrSlug(idOrSlug: String): Mono<UserResponse> {
        return mono {
            val user = findByIdOrSlug(idOrSlug).awaitFirst()
            val online = userSessionRepository.countByUserAndDisconnectedAtNull(user).awaitFirst() != 0L

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

    private fun findById(id: String) = userRepository.findById(id)
            .switchIfEmpty(Mono.error(UserNotFoundException("Could not find user with id $id")))

    private fun findByIdOrSlug(idOrSlug: String) = userRepository.findByIdOrSlug(idOrSlug, idOrSlug)
            .switchIfEmpty(Mono.error(UserNotFoundException("Could not find user with id or slug $idOrSlug")))

}
