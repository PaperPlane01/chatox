package chatox.user.repository

import chatox.user.domain.GlobalBan
import chatox.user.domain.User
import chatox.user.repository.custom.GlobalBanCustomRepository
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

interface GlobalBanRepository : ReactiveMongoRepository<GlobalBan, String>, GlobalBanCustomRepository {
    override fun findById(id: String): Mono<GlobalBan>
    fun findByBannedUserAndId(user: User, id: String): Mono<GlobalBan>
    fun findByBannedUserAndExpiresAtAfterOrPermanentTrueAndCanceledFalse(
            bannedUser: User,
            date: ZonedDateTime
    ): Flux<GlobalBan>
    fun findAllBy(pageable: Pageable): Flux<GlobalBan>
    fun findByCanceledFalseAndExpiresAtAfter(date: ZonedDateTime, pageable: Pageable): Flux<GlobalBan>
    fun findByExpiresAtAfter(date: ZonedDateTime, pageable: Pageable): Flux<GlobalBan>
    fun findByCanceledFalse(pageable: Pageable): Flux<GlobalBan>
}
