package chatox.chat.repository.mongodb.custom.impl

import chatox.chat.model.Chat
import chatox.chat.model.ChatMessagesCounter
import chatox.chat.repository.mongodb.custom.ChatMessagesCounterCustomRepository
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
        return getNextCounterValue(chat.id)
    }

    override fun getNextCounterValue(chatId: String): Mono<Long> {
       return increaseCounterValue(chatId, 1)
    }

    override fun increaseCounterValue(chatId: String, number: Long): Mono<Long> {
        val query = Query()
        query.addCriteria(Criteria.where("chatId").`is`(chatId))

        val update = Update()
        update.inc("messagesCount", number)

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
