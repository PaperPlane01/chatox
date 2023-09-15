package chatox.user.repository

import chatox.user.domain.User
import chatox.user.repository.custom.UserCustomRepository
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface UserRepository : ReactiveMongoRepository<User, String>, UserCustomRepository {
    fun save(user: User): Mono<User>
    override fun findById(id: String): Mono<User>
    fun findByIdOrSlug(id: String, slug: String): Mono<User>
    fun findByAccountId(accountId: String): Flux<User>
    fun findBySlug(slug: String): Mono<User>
    fun findByOnlineTrue(): Flux<User>
    fun findByAvatarNotNull(): Flux<User>
}
