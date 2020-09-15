package chatox.chat.repository.custom.impl

import chatox.chat.model.ChatParticipation
import chatox.chat.model.User
import chatox.chat.repository.custom.ChatParticipationCustomRepository
import com.mongodb.client.result.UpdateResult
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
class ChatParticipationCustomRepositoryImpl(
        private val reactiveMongoTemplate: ReactiveMongoTemplate) : ChatParticipationCustomRepository {

    override fun updateDisplayedNameOfChatParticipationsByUser(user: User): Mono<UpdateResult> {
        val query = Query()
        query.addCriteria(Criteria.where("user.\$id").`is`(user.id))

        var displayedName = user.firstName

        if (user.lastName != null) {
            displayedName = "$displayedName ${user.lastName}"
        }

        val update = Update()
        update.set("userDisplayedName", displayedName)

        return reactiveMongoTemplate
                .updateMulti(query, update, ChatParticipation::class.java)
    }

}