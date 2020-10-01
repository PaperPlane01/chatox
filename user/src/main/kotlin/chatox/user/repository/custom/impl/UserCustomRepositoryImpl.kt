package chatox.user.repository.custom.impl

import chatox.user.domain.User
import chatox.user.repository.custom.UserCustomRepository
import com.mongodb.client.result.UpdateResult
import org.slf4j.LoggerFactory
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Repository
class UserCustomRepositoryImpl(private val reactiveMongoTemplate: ReactiveMongoTemplate) : UserCustomRepository {
    private val log = LoggerFactory.getLogger(this.javaClass)

    override fun findAndIncreaseActiveSessionsCount(userId: String, increaseValue: Int): Mono<User> {
        log.debug("Increasing activeSessionsCount of user $userId by $increaseValue")
        val query = Query().addCriteria(Criteria.where("_id").`is`(userId))
        val update = Update().inc("activeSessionsCount", increaseValue)
        val options = FindAndModifyOptions().returnNew(true)

        return reactiveMongoTemplate.findAndModify(query, update, options, User::class.java)
    }

    override fun findAndDecreaseActiveSessionsCount(userId: String, decreaseValue: Int): Mono<User> {
        log.debug("Decreasing activeSessionsCount of user $userId by $decreaseValue")
        val query = Query().addCriteria(Criteria.where("_id").`is`(userId))
        val update = Update().inc("activeSessionsCount", decreaseValue * (-1))
        val options = FindAndModifyOptions().returnNew(true)

        return reactiveMongoTemplate.findAndModify(query, update, options, User::class.java)
    }

    override fun updateLastSeenDateIfNecessary(userId: String, lastSeen: ZonedDateTime): Mono<UpdateResult> {
        val query = Query()
                .addCriteria(Criteria.where("_id").`is`(userId))
                .addCriteria(Criteria.where("lastSeen").lt(lastSeen))
        val update = Update().set("lastSeen", lastSeen)

        return reactiveMongoTemplate.updateFirst(query, update, User::class.java)
    }

}
