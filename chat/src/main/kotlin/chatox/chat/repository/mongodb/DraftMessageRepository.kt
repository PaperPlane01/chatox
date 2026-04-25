package chatox.chat.repository.mongodb

import chatox.chat.model.DraftMessage
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface DraftMessageRepository : ReactiveMongoRepository<DraftMessage, String> {
    fun findByChatIdAndSenderId(chatId: String, senderId: String): Mono<DraftMessage>
    fun findByChatIdInAndSenderId(chatIds: List<String>, senderId: String): Flux<DraftMessage>
}