package chatox.chat.repository

import chatox.chat.model.Chat
import chatox.chat.model.MessageRead
import chatox.chat.model.User
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Mono

interface MessageReadRepository : ReactiveMongoRepository<MessageRead, String> {
    fun save(messageRead: MessageRead): Mono<MessageRead>
    fun findTopByUserAndChatOrderByDateDesc(user: User, chat: Chat): Mono<MessageRead>
    fun existsByUserAndChat(user: User, chat: Chat): Mono<Boolean>
    fun existsByUserIdAndMessageChatId(userId: String, chatId: String): Mono<Boolean>
}
