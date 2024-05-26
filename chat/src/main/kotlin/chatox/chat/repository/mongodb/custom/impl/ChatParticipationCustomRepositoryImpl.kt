package chatox.chat.repository.mongodb.custom.impl

import chatox.chat.model.ChatParticipation
import chatox.chat.model.User
import chatox.chat.repository.mongodb.custom.ChatParticipationCustomRepository
import com.mongodb.client.result.UpdateResult
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
class ChatParticipationCustomRepositoryImpl(private val reactiveMongoTemplate: ReactiveMongoTemplate) : ChatParticipationCustomRepository {

    override fun updateChatParticipationsOfUser(user: User): Mono<UpdateResult> {
        val query = Query()
        query.addCriteria(Criteria.where("user._id").`is`(user.id))

        var displayedName = user.firstName

        if (user.lastName != null) {
            displayedName = "$displayedName ${user.lastName}"
        }

        val update = Update()
        update.set("userDisplayedName", displayedName)
        update.set("userSlug", user.slug)
        update.set("user", user)

        return reactiveMongoTemplate
                .updateMulti(query, update, ChatParticipation::class.java)
    }

    override fun updateChatDeleted(chatId: String, chatDeleted: Boolean): Mono<UpdateResult> {
        val query = Query()
        query.addCriteria(Criteria.where("chatId").`is`(chatId))

        val update = Update()
        update.set("chatDeleted", chatDeleted)

        return reactiveMongoTemplate
                .updateMulti(query, update, ChatParticipation::class.java)
    }

    override fun searchChatParticipants(chatId: String, searchQuery: String, pageable: Pageable): Flux<ChatParticipation> {
        val query = Query().with(pageable)

        query.addCriteria(Criteria.where("chatId").`is`(chatId))
        query.addCriteria(Criteria().orOperator(
                Criteria.where("userDisplayedName").regex(searchQuery, "i"),
                Criteria.where("userSlug").regex(searchQuery, "i")
        ))

        return reactiveMongoTemplate.find(query, ChatParticipation::class.java)
    }

    override fun findByChatIdAndUserIdOrSlugIn(chatId: String, userIdsOrSlugs: List<String>, includeDeleted: Boolean, excludedUsersIds: List<String>): Flux<ChatParticipation> {
        val query = Query()

        query.addCriteria(Criteria.where("chatId").`is`(chatId))
        query.addCriteria(Criteria().orOperator(
                Criteria.where("user._id").`in`(userIdsOrSlugs),
                Criteria.where("userSlug").`in`(userIdsOrSlugs)
        ))

        if (!includeDeleted) {
            query.addCriteria(Criteria.where("deleted").`is`(false))
        }

        if (excludedUsersIds.isNotEmpty()) {
            query.addCriteria(Criteria.where("user._id").nin(excludedUsersIds))
        }

        return reactiveMongoTemplate.find(query, ChatParticipation::class.java)
    }

    override fun findWithCustomNotificationsSettings(userId: String): Flux<ChatParticipation> {
        val query = Query()

        query.addCriteria(Criteria.where("user._id").`is`(userId))
        query.addCriteria(Criteria.where("notificationsSettings").ne(null))

        return reactiveMongoTemplate.find(query, ChatParticipation::class.java)
    }
}
