package chatox.chat.repository.mongodb

import chatox.chat.model.ChatBlocking
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

interface ChatBlockingMongoRepository : ReactiveMongoRepository<ChatBlocking, String> {
    fun save(chatBlocking: ChatBlocking): Mono<ChatBlocking>
    override fun findById(id: String): Mono<ChatBlocking>
    fun findByChatIdAndBlockedUntilAfterAndCanceled(chatId: String, date: ZonedDateTime, canceled: Boolean, pageable: Pageable): Flux<ChatBlocking>
    fun findByChatIdAndBlockedUntilBeforeOrCanceled(chatId: String, date: ZonedDateTime, canceled: Boolean, pageable: Pageable): Flux<ChatBlocking>
    fun findByChatId(chatId: String, pageable: Pageable): Flux<ChatBlocking>
    fun findByChatIdAndBlockedUserIdAndBlockedUntilAfterAndCanceled(chatId: String, blockedUserId: String, date: ZonedDateTime, canceled: Boolean): Flux<ChatBlocking>
}
