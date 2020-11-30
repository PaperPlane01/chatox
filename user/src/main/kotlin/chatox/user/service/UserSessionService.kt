package chatox.user.service

import chatox.user.api.response.UserSessionResponse
import chatox.user.messaging.rabbitmq.event.UserConnected
import chatox.user.messaging.rabbitmq.event.UserDisconnected
import chatox.platform.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface UserSessionService {
    fun userConnected(userConnected: UserConnected): Mono<Void>
    fun userDisconnected(userDisconnected: UserDisconnected): Mono<Void>
    fun findActiveSessionsOfCurrentUser(): Flux<UserSessionResponse>
    fun findSessionsOfCurrentUser(paginationRequest: PaginationRequest): Flux<UserSessionResponse>
    fun lookForInactiveSessions()
}
