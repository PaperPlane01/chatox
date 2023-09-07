package chatox.user.repository.custom.impl

import chatox.user.domain.UserInteractionsCount
import chatox.user.repository.custom.UserInteractionsCountCustomRepository
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
class UserInteractionsCountCustomRepositoryImpl(
        private val reactiveMongoTemplate: ReactiveMongoTemplate) : UserInteractionsCountCustomRepository {

    override fun incrementLikesCount(userId: String): Mono<UserInteractionsCount> {
        val query = createUserIdQuery(userId)
        val update = createIncrementUpdate(LIKES_COUNT)
        return executeFindAndModify(query, update)
    }

    override fun incrementDislikesCount(userId: String): Mono<UserInteractionsCount> {
        val query = createUserIdQuery(userId)
        val update = createIncrementUpdate(DISLIKES_COUNT)
        return executeFindAndModify(query, update)
    }

    override fun incrementLovesCount(userId: String): Mono<UserInteractionsCount> {
        val query = createUserIdQuery(userId)
        val update = createIncrementUpdate(LOVES_COUNT)
        return executeFindAndModify(query, update)
    }

    override fun decrementLikesCount(userId: String): Mono<UserInteractionsCount> {
        val query = createUserIdQuery(userId)
        val update = createDecrementUpdate(LIKES_COUNT)
        return executeFindAndModify(query, update, false)
    }

    override fun decrementDislikesCount(userId: String): Mono<UserInteractionsCount> {
        val query = createUserIdQuery(userId)
        val update = createDecrementUpdate(DISLIKES_COUNT)
        return executeFindAndModify(query, update, false)
    }

    override fun decrementLovesCount(userId: String): Mono<UserInteractionsCount> {
        val query = createUserIdQuery(userId)
        val update = createDecrementUpdate(LOVES_COUNT)
        return executeFindAndModify(query, update, false)
    }

    private fun createUserIdQuery(userId: String) = Query().addCriteria(Criteria.where("userId").`is`(userId))

    private fun createIncrementUpdate(field: String): Update {
        val update = Update()
        update.inc(field)

        PROPERTIES
                .filter { property -> property != field }
                .forEach { property -> update.setOnInsert(property, 0) }

        return update
    }

    private fun createDecrementUpdate(field: String): Update {
        val update = Update()
        update.inc(field, -1)

        return update
    }

    private fun executeFindAndModify(query: Query, update: Update, upsert: Boolean = true): Mono<UserInteractionsCount> {
        val options = FindAndModifyOptions.options()
                .returnNew(true)
                .upsert(upsert)


        return reactiveMongoTemplate.findAndModify(
                query,
                update,
                options,
                UserInteractionsCount::class.java
        )
    }

    private companion object {
        const val LIKES_COUNT = "likesCount"
        const val DISLIKES_COUNT = "dislikesCount"
        const val LOVES_COUNT = "lovesCount"
        val PROPERTIES = listOf(LIKES_COUNT, DISLIKES_COUNT, LOVES_COUNT)
    }
}