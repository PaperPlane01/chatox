package chatox.user.service

import chatox.user.api.response.BlacklistStatusResponse
import chatox.user.api.response.UserResponse
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface UserBlacklistService {
    fun blacklistUser(userId: String): Flux<UserResponse>
    fun removeUserFromBlackList(userId: String): Flux<UserResponse>
    fun getBlacklistOfCurrentUser(): Flux<UserResponse>
    fun getBlacklistStatus(userId: String): Mono<BlacklistStatusResponse>
    fun isUserBlacklisted(checkedUserId: String, blacklistOwnerId: String): Mono<Boolean>
}
