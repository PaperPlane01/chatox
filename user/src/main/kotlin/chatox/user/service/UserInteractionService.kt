package chatox.user.service

import chatox.platform.pagination.PaginationRequest
import chatox.user.api.response.UserInteractionResponse
import chatox.user.api.response.UserInteractionsCountResponse
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface UserInteractionService {
    fun likeUser(userId: String): Mono<UserInteractionsCountResponse>
    fun dislikeUser(userId: String): Mono<UserInteractionsCountResponse>
    fun loveUser(userId: String): Mono<UserInteractionsCountResponse>
    fun getUserInteractionsCount(userId: String): Mono<UserInteractionsCountResponse>
    fun rollbackUserInteraction(userInteractionId: String): Mono<Unit>
    fun getUserInteractionsHistory(userId: String, paginationRequest: PaginationRequest): Flux<UserInteractionResponse>
}