package chatox.chat.repository

import chatox.chat.model.Chat
import chatox.chat.model.Message
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Mono
import java.util.Date

interface MessageRepository : ReactiveMongoRepository<Message, String> {
    fun save(message: Message): Mono<Message>
    override fun findById(id: String): Mono<Message>
    fun findByChat(chat: Chat, pageable: Pageable): Mono<Page<Message>>
    fun countByChat(chat: Chat): Mono<Int>
    fun findByCreatedAtAfter(date: Date, pageable: Pageable): Mono<Page<Message>>
    fun countByChatAndCreatedAtAfter(chat: Chat, date: Date): Mono<Int>
}
