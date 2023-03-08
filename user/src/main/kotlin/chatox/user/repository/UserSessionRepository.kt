package chatox.user.repository

import chatox.user.domain.UserSession
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

interface UserSessionRepository : ReactiveMongoRepository<UserSession, String> {
    override fun findById(id: String): Mono<UserSession>
    fun findBySocketIoId(socketIoId: String): Mono<UserSession>
    fun findByUserId(userId: String, pageable: Pageable): Flux<UserSession>
    fun findByUserIdAndDisconnectedAtNull(userId: String): Flux<UserSession>
    fun countByUserIdAndDisconnectedAtNull(userId: String): Mono<Long>
    fun countByUserIdAndDisconnectedAtNullAndIdNot(userId: String, excludedId: String): Mono<Long>
    fun findByDisconnectedAtNullAndCreatedAtBefore(createdAt: ZonedDateTime): Flux<UserSession>
}
