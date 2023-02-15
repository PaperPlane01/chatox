package chatox.user.repository.custom.impl

import chatox.user.domain.User
import chatox.user.repository.custom.UserCustomRepository
import com.mongodb.client.result.UpdateResult
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Repository
class UserCustomRepositoryImpl(private val reactiveMongoTemplate: ReactiveMongoTemplate) : UserCustomRepository {

    override fun updateLastSeenDateIfNecessary(userId: String, lastSeen: ZonedDateTime): Mono<UpdateResult> {
        val query = Query()
                .addCriteria(Criteria.where("_id").`is`(userId))
                .addCriteria(Criteria.where("lastSeen").lt(lastSeen))
        val update = Update().set("lastSeen", lastSeen)

        return reactiveMongoTemplate.updateFirst(query, update, User::class.java)
    }

}
