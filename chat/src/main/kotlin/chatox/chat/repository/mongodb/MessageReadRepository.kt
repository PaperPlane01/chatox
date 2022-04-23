package chatox.chat.repository

import chatox.chat.model.MessageRead
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Mono

interface MessageReadRepository : ReactiveMongoRepository<MessageRead, String> {
    fun save(messageRead: MessageRead): Mono<MessageRead>
    fun findTopByUserIdAndChatIdOrderByDateDesc(userId: String, chatId: String): Mono<MessageRead>
    fun existsByUserIdAndChatId(userId: String, chatId: String): Mono<Boolean>
}
