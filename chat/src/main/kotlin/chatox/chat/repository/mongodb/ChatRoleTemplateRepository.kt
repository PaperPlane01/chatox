package chatox.chat.repository.mongodb

import chatox.chat.model.ChatRoleTemplate
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Mono

interface ChatRoleTemplateRepository : ReactiveMongoRepository<ChatRoleTemplate, String> {
    fun findByName(name: String): Mono<ChatRoleTemplate>
    fun existsByName(name: String): Mono<Boolean>
}