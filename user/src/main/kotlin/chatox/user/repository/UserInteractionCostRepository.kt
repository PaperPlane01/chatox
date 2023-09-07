package chatox.user.repository

import chatox.user.domain.UserInteractionCost
import chatox.user.domain.UserInteractionType
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface UserInteractionCostRepository : ReactiveMongoRepository<UserInteractionCost, String> {
    fun findByType(type: UserInteractionType): Mono<UserInteractionCost>
    fun findByTypeIn(types: List<UserInteractionType>): Flux<UserInteractionCost>
}