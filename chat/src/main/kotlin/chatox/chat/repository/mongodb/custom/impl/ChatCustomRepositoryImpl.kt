package chatox.chat.repository.mongodb.custom.impl

import chatox.chat.model.Chat
import chatox.chat.repository.mongodb.custom.ChatCustomRepository
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
class ChatCustomRepositoryImpl(private val reactiveMongoTemplate: ReactiveMongoTemplate) : ChatCustomRepository {
    override fun increaseNumberOfParticipants(chatId: String): Mono<Chat> {
        val query = Query()
        query.addCriteria(Criteria.where("_id").`is`(chatId))

        val update = Update()
        update.inc("numberOfParticipants")

        return reactiveMongoTemplate.findAndModify(query, update, Chat::class.java)
    }

    override fun decreaseNumberOfParticipants(chatId: String): Mono<Chat> {
        val query = Query()
        query.addCriteria(Criteria.where("_id").`is`(chatId))
        query.addCriteria(Criteria.where("numberOfParticipants").gt(0))

        val update = Update()
        update.inc("numberOfParticipants", -1)

        return reactiveMongoTemplate.findAndModify(query, update, Chat::class.java)
    }

    override fun increaseNumberOfOnlineParticipants(chatId: String): Mono<Chat> {
        val query = Query()
        query.addCriteria(Criteria.where("_id").`is`(chatId))

        val update = Update()
        update.inc("numberOfOnlineParticipants")

        return reactiveMongoTemplate.findAndModify(query, update, Chat::class.java)
    }

    override fun decreaseNumberOfOnlineParticipants(chatId: String): Mono<Chat> {
        val query = Query()
        query.addCriteria(Criteria.where("_id").`is`(chatId))
        query.addCriteria(Criteria.where("numberOfOnlineParticipants").gt(0))

        val update = Update()
        update.inc("numberOfOnlineParticipants", -1)

        return reactiveMongoTemplate.findAndModify(query, update, Chat::class.java)
    }

}
