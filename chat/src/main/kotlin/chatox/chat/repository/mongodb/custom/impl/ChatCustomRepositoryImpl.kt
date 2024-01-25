package chatox.chat.repository.mongodb.custom.impl

import chatox.chat.model.Chat
import chatox.chat.repository.mongodb.custom.ChatCustomRepository
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
class ChatCustomRepositoryImpl(private val reactiveMongoTemplate: ReactiveMongoTemplate) : ChatCustomRepository {
    override fun increaseNumberOfParticipants(chatId: String): Mono<Chat> {
        val query = createChatIdQuery(chatId)
        val update = createIncreaseQuery(NUMBER_OF_PARTICIPANTS)
        return reactiveMongoTemplate.findAndModify(query, update, Chat::class.java)
    }

    override fun increaseNumberOfParticipants(chatId: String, number: Int): Mono<Chat> {
        val query = createChatIdQuery(chatId)
        val update = createDecreaseQuery(NUMBER_OF_PARTICIPANTS)
        return reactiveMongoTemplate.findAndModify(query, update, Chat::class.java)
    }

    override fun decreaseNumberOfParticipants(chatId: String): Mono<Chat> {
        val query = createChatIdQuery(chatId)
        query.addCriteria(Criteria.where(NUMBER_OF_PARTICIPANTS).gt(0))

        val update = createDecreaseQuery(NUMBER_OF_PARTICIPANTS)

        return reactiveMongoTemplate.findAndModify(query, update, Chat::class.java)
    }

    override fun increaseNumberOfOnlineParticipants(chatId: String): Mono<Chat> {
        val query = createChatIdQuery(chatId)
        val update = createIncreaseQuery(NUMBER_OF_ONLINE_PARTICIPANTS)
        val options = FindAndModifyOptions().returnNew(true)
        return reactiveMongoTemplate.findAndModify(query, update, options, Chat::class.java)
    }

    override fun decreaseNumberOfOnlineParticipants(chatId: String): Mono<Chat> {
        val query = createChatIdQuery(chatId)
        query.addCriteria(Criteria.where(NUMBER_OF_ONLINE_PARTICIPANTS).gt(0))
        val update = createDecreaseQuery(NUMBER_OF_ONLINE_PARTICIPANTS)
        val options = FindAndModifyOptions().returnNew(true)
        return reactiveMongoTemplate.findAndModify(query, update, options, Chat::class.java)
    }

    private fun createIncreaseQuery(field: String) = createIncreaseQuery(field, 1)

    private fun createDecreaseQuery(field: String) = createIncreaseQuery(field, -1)

    private fun createIncreaseQuery(field: String, number: Long): Update {
        val update = Update()
        update.inc(field, number)

        return update
    }

    private fun createChatIdQuery(chatId: String): Query {
        val query = Query()
        query.addCriteria(Criteria.where("_id").`is`(chatId))
        return query
    }

    companion object {
        const val NUMBER_OF_PARTICIPANTS = "numberOfParticipants"
        const val NUMBER_OF_ONLINE_PARTICIPANTS = "numberOfOnlineParticipants"
    }
}
