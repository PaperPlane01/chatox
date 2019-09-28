package chatox.user.repository

import chatox.user.domain.User
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface UserRepository : ReactiveCrudRepository<User, String> {
    fun save(user: User): Mono<User>
    fun findByIdOrSlug(id: String, slug: String): Mono<User>
    fun findByAccountId(accountId: String): Flux<User>
}
