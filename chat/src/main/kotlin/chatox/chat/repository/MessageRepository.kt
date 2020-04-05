package chatox.chat.repository

import chatox.chat.model.Chat
import chatox.chat.model.Message
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.Date

interface MessageRepository : ReactiveMongoRepository<Message, String> {
    fun save(message: Message): Mono<Message>
    override fun findById(id: String): Mono<Message>
    fun findByChat(chat: Chat, pageable: Pageable): Flux<Message>
    fun countByChat(chat: Chat): Mono<Int>
    fun findTopByChatOrderByCreatedAtDesc(chat: Chat): Mono<Message>
    fun countByChatAndCreatedAtAfter(chat: Chat, date: ZonedDateTime): Mono<Int>
    fun findByChatAndCreatedAtGreaterThanEqual(chat: Chat, date: ZonedDateTime, pageable: Pageable): Flux<Message>
    fun findByChatAndCreatedAtLessThanEqual(chat: Chat, date: ZonedDateTime, pageable: Pageable): Flux<Message>
}
