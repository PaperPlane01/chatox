package chatox.user.service.impl

import chatox.user.api.request.CreateUserRequest
import chatox.user.api.request.UpdateUserRequest
import chatox.user.api.response.UserResponse
import chatox.user.exception.UserNotFoundException
import chatox.user.mapper.UserMapper
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
                      private val userMapper: UserMapper) : UserService {

    override fun createUser(createUserRequest: CreateUserRequest): Mono<UserResponse> {
        val user = userMapper.fromCreateUserRequest(createUserRequest)

        return userRepository.save(user)
                .map (userMapper::toUserResponse)
    }

    override fun updateUser(userIdOrSlug: String, updateUserRequest: UpdateUserRequest): Mono<UserResponse> {
        return findByIdOrSlug(userIdOrSlug)
                .map { user -> userMapper.mapUserUpdate(user, updateUserRequest) }
                .map { user -> userRepository.save(user) }
                .flatMap { user -> user }
                .map { user -> userMapper.toUserResponse(user) }
    }

    override fun deleteUser(userIdOrSlug: String): Mono<Void> {
        return findByIdOrSlug(userIdOrSlug)
                .map { user -> user.copy(deleted = true) }
                .map { user -> userRepository.save(user) }
                .flatMap {  Mono.empty<Void>() }
    }

    override fun findUserByIdOrSlug(idOrSlug: String): Mono<UserResponse> {
        return findByIdOrSlug(idOrSlug)
                .map { user -> userMapper.toUserResponse(user) }
    }

    override fun findUsersByAccount(accountId: String): Flux<UserResponse> {
        return userRepository.findByAccountId(accountId)
                .map { user -> userMapper.toUserResponse(user) }
    }

    private fun findByIdOrSlug(idOrSlug: String) = userRepository.findByIdOrSlug(idOrSlug, idOrSlug)
            .switchIfEmpty { Mono.error(UserNotFoundException("Could not find user with id or slug $idOrSlug")) }

}
