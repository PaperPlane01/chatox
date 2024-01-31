package chatox.chat.repository.mongodb.custom.impl

import chatox.chat.model.ChatParticipantsCount
import chatox.chat.repository.mongodb.custom.ChatParticipantsCountCustomRepository
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
class ChatParticipantsCountCustomRepositoryImpl(
        private val reactiveMongoTemplate: ReactiveMongoTemplate) : ChatParticipantsCountCustomRepository {

    override fun increaseParticipantsCount(chatId: String): Mono<ChatParticipantsCount> {
        return increaseOnlineParticipantsCount(chatId, 1)
    }

    override fun increaseParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount> {
        val query = createChatIdQuery(chatId)
        val update = createIncreaseQuery(PARTICIPANTS_COUNT, number)

        return reactiveMongoTemplate.findAndModify(
                query,
                update,
                createDefaultOptions(),
                ChatParticipantsCount::class.java
        )
    }

    override fun decreaseParticipantsCount(chatId: String): Mono<ChatParticipantsCount> {
        return decreaseParticipantsCount(chatId, 1)
    }

    override fun decreaseParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount> {
        val query = createChatIdQuery(chatId)
        val update = createDecreaseQuery(PARTICIPANTS_COUNT, number)

        return reactiveMongoTemplate.findAndModify(
                query,
                update,
                createDefaultOptions(),
                ChatParticipantsCount::class.java
        )
    }

    override fun increaseOnlineParticipantsCount(chatId: String): Mono<ChatParticipantsCount> {
        return increaseParticipantsCount(chatId, 1)
    }

    override fun increaseOnlineParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount> {
        val query = createChatIdQuery(chatId)
        val update = createIncreaseQuery(ONLINE_PARTICIPANTS_COUNT, number)

        return reactiveMongoTemplate.findAndModify(
                query,
                update,
                createDefaultOptions(),
                ChatParticipantsCount::class.java
        )
    }

    override fun decreaseOnlineParticipantsCount(chatId: String): Mono<ChatParticipantsCount> {
        return decreaseParticipantsCount(chatId, 1)
    }

    override fun decreaseOnlineParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount> {
        val query = createChatIdQuery(chatId)
        val update = createDecreaseQuery(ONLINE_PARTICIPANTS_COUNT, number)

        return reactiveMongoTemplate.findAndModify(
                query,
                update,
                createDefaultOptions(),
                ChatParticipantsCount::class.java
        )
    }

    private fun createDecreaseQuery(field: String, number: Int) = createIncreaseQuery(field, -1 * number)

    private fun createIncreaseQuery(field: String, number: Int): Update {
        val update = Update()
        update.inc(field, number)

        return update
    }

    private fun createChatIdQuery(chatId: String): Query {
        val query = Query()
        query.addCriteria(Criteria.where("chatId").`is`(chatId))
        return query
    }

    private fun createDefaultOptions() = FindAndModifyOptions().returnNew(true)

    companion object {
        const val PARTICIPANTS_COUNT = "participantsCount"
        const val ONLINE_PARTICIPANTS_COUNT = "onlineParticipantsCount"
    }
}