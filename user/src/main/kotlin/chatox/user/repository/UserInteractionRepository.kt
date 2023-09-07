package chatox.user.repository

import chatox.user.domain.UserInteraction
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux

interface UserInteractionRepository : ReactiveMongoRepository<UserInteraction, String> {
    fun findByTargetUserId(id: String, pageable: Pageable): Flux<UserInteraction>
}