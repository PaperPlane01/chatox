package chatox.user.repository

import chatox.user.domain.UserInteractionsCount
import chatox.user.repository.custom.UserInteractionsCountCustomRepository
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Mono

interface UserInteractionsCountRepository : ReactiveMongoRepository<UserInteractionsCount, String>,
        UserInteractionsCountCustomRepository {
    fun findByUserId(userId: String): Mono<UserInteractionsCount>
}