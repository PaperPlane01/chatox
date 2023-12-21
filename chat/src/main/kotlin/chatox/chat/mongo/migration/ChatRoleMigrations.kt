package chatox.chat.mongo.migration

import chatox.chat.model.ChatRole
import com.kuliginstepan.mongration.annotation.Changelog
import com.kuliginstepan.mongration.annotation.Changeset
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import reactor.core.publisher.Mono

@Changelog
class ChatRoleMigrations {
    private val log = LoggerFactory.getLogger(this::class.java)

    @Changeset(order = 1, author = "mongration")
    fun enableInviteManagementForChatAdmins(mongoTemplate: ReactiveMongoTemplate): Mono<Unit> {
        return mono {
            log.info("Executing migration: enable invite management for chat admins")

            val query = Query()
            query.addCriteria(Criteria.where("features.changeChatSettings.enabled").`is`(true))

            val update = Update()
            update.set("features.manageInvites.enabled", true)

            mongoTemplate.updateMulti(query, update, ChatRole::class.java).awaitFirst()

            log.info("Finished executing migration: enable invite management for chat admins")
        }
    }

    @Changeset(order = 2, author = "mongration")
    fun enableChatJoinRequestApprovalForChatAdmins(mongoTemplate: ReactiveMongoTemplate): Mono<Unit> {
        return mono {
            log.info("Executing migration: enable chat invite management for chat admins")

            val query = Query()
            query.addCriteria(Criteria.where("features.changeChatSettings.enabled").`is`(true))

            val update = Update()
            update.set("features.approveJoinChatRequest.enabled", true)

            mongoTemplate.updateMulti(query, update, ChatRole::class.java).awaitFirst()

            log.info("Finished executing migration: enable chat invite management for chat admins")
        }
    }
}