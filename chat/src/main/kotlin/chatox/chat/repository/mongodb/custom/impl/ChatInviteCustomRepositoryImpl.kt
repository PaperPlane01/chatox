package chatox.chat.repository.mongodb.custom.impl

import chatox.chat.model.ChatInvite
import chatox.chat.repository.mongodb.custom.ChatInviteCustomRepository
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.aggregation.ComparisonOperators
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
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

    override fun updateChatInviteUsage(chatInvite: ChatInvite, lastUsedBy: String, lastUsedAt: ZonedDateTime): Mono<ChatInvite> {
        val query = Query()

        query.addCriteria(Criteria.where("_id").`is`(chatInvite.id))

        val update = createUsageUpdate(1, lastUsedAt, lastUsedBy)

        return reactiveMongoTemplate.findAndModify(
                query,
                update,
                ChatInvite::class.java
        )
    }

    override fun updateChatInviteUsage(inviteId: String, lastUsedBy: String, lastUsedAt: ZonedDateTime, useTimesIncrease: Int): Mono<ChatInvite> {
        val query = Query()

        query.addCriteria(Criteria.where("_id").`is`(inviteId))

        val update = createUsageUpdate(useTimesIncrease, lastUsedAt, lastUsedBy)

        return reactiveMongoTemplate.findAndModify(
                query,
                update,
                ChatInvite::class.java
        )
    }

    private fun createUsageUpdate(useTimesIncrease: Int, lastUsedAt: ZonedDateTime, lastUsedBy: String): Update {
        val update = Update()
        update.inc("useTimes", useTimesIncrease)
        update.set("lastUsedAt", lastUsedAt)
        update.set("lastUsedBy", lastUsedBy)

        return update
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
                            Criteria.expr(
                                    ComparisonOperators.Gt
                                            .valueOf("\$maxUseTimes")
                                            .greaterThan("\$useTimes")
                            )
                    )
            )
    )
}