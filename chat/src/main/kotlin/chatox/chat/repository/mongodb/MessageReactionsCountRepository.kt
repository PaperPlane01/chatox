package chatox.chat.repository.mongodb

import chatox.chat.model.MessageReactionsCount
import chatox.chat.repository.mongodb.custom.MessageReactionsCountCustomRepository
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux

interface MessageReactionsCountRepository : ReactiveMongoRepository<MessageReactionsCount, String>,
    MessageReactionsCountCustomRepository {
        fun findByMessageId(messageId: String): Flux<MessageReactionsCount>
}