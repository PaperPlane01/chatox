package chatox.chat.mongo.migration

import chatox.chat.model.Chat
import chatox.chat.model.ChatType
import chatox.chat.service.ChatSearchService
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
class ChatMigrations {
    private val log = LoggerFactory.getLogger(this.javaClass)

    @Changeset(order = 1, author = "mongration")
    fun setHideFromSearchForGroupChats(
            reactiveMongoTemplate: ReactiveMongoTemplate,
            chatSearchService: ChatSearchService
    ): Mono<Unit> {
        return mono {
            log.info("Executing migration: set hideFromSearch for group chats")

            val query = Query()
            query.addCriteria(Criteria.where("type").`is`(ChatType.GROUP))

            val update = Update()
            update.set("hideFromSearch", false)

            reactiveMongoTemplate.updateMulti(
                    query,
                    update,
                    Chat::class.java
            )
                    .awaitFirst()

            chatSearchService.importChatsToElasticsearch(deleteIndex = true).awaitFirst()
        }
    }
}