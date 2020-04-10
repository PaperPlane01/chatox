package chatox.chat.repository

import chatox.chat.model.Chat
import chatox.chat.model.ChatBlocking
import chatox.chat.model.User
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

interface ChatBlockingRepository : ReactiveMongoRepository<ChatBlocking, String> {
    fun save(chatBlocking: ChatBlocking): Mono<ChatBlocking>
    override fun findById(id: String): Mono<ChatBlocking>
    fun findByChatAndBlockedUntilAfterAndCanceled(chat: Chat, date: ZonedDateTime, canceled: Boolean, pageable: Pageable): Flux<ChatBlocking>
    fun findByChatAndBlockedUntilBeforeOrCanceled(chat: Chat, date: ZonedDateTime, canceled: Boolean, pageable: Pageable): Flux<ChatBlocking>
    fun findByChat(chat: Chat, pageable: Pageable): Flux<ChatBlocking>
    fun findByChatAndBlockedUserAndBlockedUntilAfterAndCanceled(chat: Chat, blockedUser: User, date: ZonedDateTime, canceled: Boolean): Flux<ChatBlocking>
}
