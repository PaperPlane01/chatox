package chatox.user.service

import chatox.user.api.request.CreateUserRequest
import chatox.user.api.request.UpdateUserRequest
import chatox.user.api.response.UserResponse
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface UserService {
    fun createUser(createUserRequest: CreateUserRequest): Mono<UserResponse>
    fun updateUser(userIdOrSlug: String, updateUserRequest: UpdateUserRequest): Mono<UserResponse>
    fun deleteUser(userIdOrSlug: String): Mono<Void>
    fun findUserByIdOrSlug(idOrSlug: String): Mono<UserResponse>
    fun findUsersByAccount(accountId: String): Flux<UserResponse>
}
