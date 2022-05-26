package chatox.chat.repository.mongodb

import chatox.chat.model.Message
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

interface MessageMongoRepository : ReactiveMongoRepository<Message, String> {
    fun save(message: Message): Mono<Message>
    override fun findById(id: String): Mono<Message>
    fun findByChatId(chatId: String, pageable: Pageable): Flux<Message>
    fun countByChatId(chatId: String): Mono<Int>
    fun countByChatIdAndCreatedAtAfterAndSenderIdNot(chatId: String, date: ZonedDateTime, senderId: String): Mono<Long>
    fun findByChatIdAndCreatedAtGreaterThanEqual(chatId: String, date: ZonedDateTime, pageable: Pageable): Flux<Message>
    fun findByChatIdAndCreatedAtLessThanEqual(chatId: String, date: ZonedDateTime, pageable: Pageable): Flux<Message>
    fun findBySenderIdAndCreatedAtAfter(senderId: String, date: ZonedDateTime): Flux<Message>
    fun findAllByChatIdOrderByCreatedAtAsc(chatId: String): Flux<Message>
    fun findByPinnedTrueAndChatId(chatId: String): Mono<Message>
    fun findByIdAndChatId(id: String, chatId: String): Mono<Message>
}
