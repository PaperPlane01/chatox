package chatox.user.repository

import chatox.user.domain.UserBlacklist
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Mono

interface UserBlacklistRepository : ReactiveMongoRepository<UserBlacklist, String> {
    fun findByUserId(userId: String): Mono<UserBlacklist>
}
