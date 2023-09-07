package chatox.user.repository.custom

import chatox.user.domain.UserInteractionsCount
import reactor.core.publisher.Mono

interface UserInteractionsCountCustomRepository {
    fun incrementLikesCount(userId: String): Mono<UserInteractionsCount>
    fun incrementDislikesCount(userId: String): Mono<UserInteractionsCount>
    fun incrementLovesCount(userId: String): Mono<UserInteractionsCount>
    fun decrementLikesCount(userId: String): Mono<UserInteractionsCount>
    fun decrementDislikesCount(userId: String): Mono<UserInteractionsCount>
    fun decrementLovesCount(userId: String): Mono<UserInteractionsCount>
}