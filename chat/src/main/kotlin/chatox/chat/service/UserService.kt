package chatox.chat.service

import chatox.chat.api.response.UserResponse
import reactor.core.publisher.Mono

interface UserService {
    fun findUserById(id: String): Mono<UserResponse>
    fun findUserByIdAndPutInLocalCache(id: String?, localCache: MutableMap<String, UserResponse>? = null): Mono<UserResponse>
}
