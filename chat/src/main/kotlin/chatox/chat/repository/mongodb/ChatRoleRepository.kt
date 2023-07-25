package chatox.chat.repository.mongodb

import chatox.chat.model.ChatRole
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatRoleRepository : ReactiveMongoRepository<ChatRole, String> {
    fun findByChatId(chatId: String): Flux<ChatRole>
    fun findByTemplateId(templateId: String): Flux<ChatRole>
    fun findByChatIdAndName(chatId: String, name: String): Mono<ChatRole>
    fun findByChatIdAndDefaultTrue(chatId: String): Mono<ChatRole>
    fun findByIdAndChatId(id: String, chatId: String): Mono<ChatRole>
    fun findByChatIdIn(ids: List<String>): Flux<ChatRole>
}