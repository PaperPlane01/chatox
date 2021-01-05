package chatox.chat.repository.custom.impl

import chatox.chat.model.Chat
import chatox.chat.model.ChatMessagesCounter
import chatox.chat.repository.custom.ChatMessagesCounterCustomRepository
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
class ChatMessagesCounterCustomRepositoryImpl(
        private val reactiveMongoTemplate: ReactiveMongoTemplate) : ChatMessagesCounterCustomRepository {

    override fun getNextCounterValue(chat: Chat): Mono<Long> {
        val query = Query()
        query.addCriteria(Criteria.where("chatId").`is`(chat.id))

        val update = Update()
        update.inc("messagesCount", 1)

        val options = FindAndModifyOptions().returnNew(true)

        return mono {
            reactiveMongoTemplate.findAndModify(
                    query,
                    update,
                    options,
                    ChatMessagesCounter::class.java
            )
                    .awaitFirst()
                    .messagesCount
        }
    }
}
