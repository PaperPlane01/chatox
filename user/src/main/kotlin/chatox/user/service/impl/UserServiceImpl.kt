package chatox.user.service.impl

import chatox.user.api.request.CreateUserRequest
import chatox.user.api.request.UpdateUserRequest
import chatox.user.api.response.UserResponse
import chatox.user.exception.UserNotFoundException
import chatox.user.mapper.UserMapper
import chatox.user.messaging.rabbitmq.event.producer.UserEventsProducer
import chatox.user.repository.UserRepository
import chatox.user.service.UserService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.core.publisher.switchIfEmpty

@Service
@Transactional
class UserServiceImpl(private val userRepository: UserRepository,
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
                .map { userMapper.toUserResponse(it) }
                .map {
                    userEventsProducer.sendUserCreatedEvent(it)
                    it
                }
    }

    override fun updateUser(id: String, updateUserRequest: UpdateUserRequest): Mono<UserResponse> {
        return findById(id)
                .map { user -> userMapper.mapUserUpdate(user, updateUserRequest) }
                .map { user -> userRepository.save(user) }
                .flatMap { user -> user }
                .map { user -> userMapper.toUserResponse(user) }
                .map {
                    userEventsProducer.sendUserUpdatedEvent(it)
                    it
                }
    }

    override fun deleteUser(id: String): Mono<Void> {
        return findById(id)
                .map { user -> user.copy(deleted = true) }
                .map { user -> userRepository.save(user) }
                .flatMap {
                    userEventsProducer.sendUserDeletedEvent(id)
                    Mono.empty<Void>()
                }
    }

    override fun findUserByIdOrSlug(idOrSlug: String): Mono<UserResponse> {
        return findByIdOrSlug(idOrSlug)
                .map { user -> userMapper.toUserResponse(user) }
    }

    override fun findUsersByAccount(accountId: String): Flux<UserResponse> {
        return userRepository.findByAccountId(accountId)
                .map { user -> userMapper.toUserResponse(user) }
    }

    private fun findById(id: String) = userRepository.findById(id)
            .switchIfEmpty { Mono.error(UserNotFoundException("Could not find user with id $id")) }

    private fun findByIdOrSlug(idOrSlug: String) = userRepository.findByIdOrSlug(idOrSlug, idOrSlug)
            .switchIfEmpty { Mono.error(UserNotFoundException("Could not find user with id or slug $idOrSlug")) }

}
