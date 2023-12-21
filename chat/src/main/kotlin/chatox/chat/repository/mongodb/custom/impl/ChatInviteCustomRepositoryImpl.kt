package chatox.chat.repository.mongodb.custom.impl

import chatox.chat.model.ChatInvite
import chatox.chat.repository.mongodb.custom.ChatInviteCustomRepository
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.MongoExpression
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Repository
class ChatInviteCustomRepositoryImpl(
        private val reactiveMongoTemplate: ReactiveMongoTemplate
) : ChatInviteCustomRepository {

    override fun findById(id: String, activeOnly: Boolean): Mono<ChatInvite> {
        val query = Query()

        query.addCriteria(Criteria.where("_id").`is`(id));

        if (activeOnly) {
            query.addCriteria(createActiveCriteria())
        }

        return reactiveMongoTemplate.findOne(query, ChatInvite::class.java)
    }

    override fun findByIdAndChatId(id: String, chatId: String, activeOnly: Boolean): Mono<ChatInvite> {
        val query = Query()

        query.addCriteria(Criteria.where("_id").`is`(id))
        query.addCriteria(Criteria.where("chatId").`is`(chatId))

        if (activeOnly) {
            query.addCriteria(createActiveCriteria())
        }

        return reactiveMongoTemplate.findOne(query, ChatInvite::class.java)
    }

    override fun findByChatId(chatId: String, activeOnly: Boolean, pageable: Pageable): Flux<ChatInvite> {
        val query = Query().with(pageable)

        query.addCriteria(Criteria.where("chatId").`is`(chatId))

        if (activeOnly) {
            query.addCriteria(createActiveCriteria())
        }

        return reactiveMongoTemplate.find(query, ChatInvite::class.java)
    }

    private fun createActiveCriteria() = Criteria().andOperator(
            Criteria.where("active").`is`(true),
            Criteria().andOperator(
                    Criteria().orOperator(
                            Criteria.where("expiresAt").isNull,
                            Criteria.where("expiresAt").gt(ZonedDateTime.now())
                    ),
                    Criteria().orOperator(
                            Criteria.where("maxUseTimes").isNull,
                            Criteria.expr(MongoExpression.create("this.maxUseTimes > this.useTimes"))
                    )
            )
    )
}