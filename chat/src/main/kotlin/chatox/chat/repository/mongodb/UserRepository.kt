package chatox.chat.repository.mongodb

import chatox.chat.model.User
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Mono

interface UserRepository : ReactiveMongoRepository<User, String> {
    fun save(user: User): Mono<User>
    override fun findById(id: String): Mono<User>
}
