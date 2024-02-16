package chatox.user.service

import chatox.user.api.request.CreateUserRequest
import chatox.user.api.request.UpdateUserRequest
import chatox.user.api.response.SlugAvailabilityResponse
import chatox.user.api.response.UserResponse
import chatox.user.domain.ImageUploadMetadata
import chatox.user.domain.Upload
import chatox.user.domain.User
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface UserService {
    fun createUser(createUserRequest: CreateUserRequest): Mono<UserResponse>
    fun updateUser(id: String, updateUserRequest: UpdateUserRequest): Mono<UserResponse>
    fun deleteUser(id: String): Mono<Void>
    fun deleteUsersByAccount(accountId: String): Flux<Void>
    fun findUserByIdOrSlug(idOrSlug: String): Mono<UserResponse>
    fun findUsersByAccount(accountId: String): Flux<UserResponse>
    fun isSlugAvailable(slug: String): Mono<SlugAvailabilityResponse>
    fun updateEmail(accountId: String, email: String): Mono<Void>
    fun assertUserExists(id: String): Mono<Unit>
}
