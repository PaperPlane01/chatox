package chatox.chat.mongo.migration

import chatox.chat.model.ChatParticipantsCount
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatType
import com.kuliginstepan.mongration.annotation.Changelog
import com.kuliginstepan.mongration.annotation.Changeset
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.slf4j.LoggerFactory
import org.springframework.data.mongodb.core.BulkOperations
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.aggregation.Aggregation
import org.springframework.data.mongodb.core.aggregation.ArrayOperators.ArrayElemAt
import org.springframework.data.mongodb.core.aggregation.ConditionalOperators
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import reactor.core.publisher.Mono

@Changelog
class ChatParticipantMigrations {
    private val log = LoggerFactory.getLogger(this.javaClass)

    @Changeset(order = 1, author = "mongration")
    fun setChatTypeForChatParticipations(reactiveMongoTemplate: ReactiveMongoTemplate): Mono<Unit> {
        return mono {
            log.info("Execute migration: set chat type for chat participations")

            var page = 0L
            val pageSize = 100L

            while (true) {
                log.info("Processing page $page")
                val aggregation = Aggregation.newAggregation(
                        Aggregation.lookup()
                                .from("chat")
                                .localField("chatId")
                                .foreignField("_id")
                                .pipeline(Aggregation.project("type"))
                                .`as`("chat"),
                        Aggregation.project()
                                .and(ArrayElemAt.arrayOf("chat").elementAt(0))
                                .`as`("chat"),
                        Aggregation.skip(page * pageSize),
                        Aggregation.limit(pageSize),
                )
                val result = reactiveMongoTemplate.aggregate(
                        aggregation,
                        "chatParticipation",
                        ChatTypeByChatParticipationQueryResult::class.java
                )
                        .collectList()
                        .awaitFirst()

                val bulkOperations = reactiveMongoTemplate.bulkOps(
                        BulkOperations.BulkMode.UNORDERED,
                        ChatParticipation::class.java
                )

                result.forEach { updatedData ->
                    val query = Query()
                    query.addCriteria(Criteria.where("_id").`is`(updatedData.id))

                    val update = Update()
                    update.set("chatType", updatedData.chat.type)

                    bulkOperations.updateOne(query, update)
                }

                bulkOperations.execute().awaitFirst()

                if (result.size < pageSize) {
                    break
                } else {
                    page += 1
                }
            }

            log.info("Finished migration: set chat type for chat participations")
        }
    }

    private data class ChatTypeByChatParticipationQueryResult(
            private val _id: String,
            val chat: ChatTypeQueryResult
    ) {
        val id: String
            get() = _id
    }

    private data class ChatTypeQueryResult(
            private val _id: String,
            val type: ChatType
    ) {
        val chatId: String
            get() = _id
    }

    @Changeset(order = 2, author = "mongration")
    fun populateChatParticipantsCountAndOnlineParticipantsCount(reactiveMongoTemplate: ReactiveMongoTemplate): Mono<Unit> {
        return mono {
            log.info("Execute migration: populate chat participants and online participants count")

            val aggregation = Aggregation.newAggregation(
                    Aggregation.match(
                            Criteria.where("deleted").`is`(false)
                                    .and("chatType").`is`(ChatType.GROUP)
                    ),
                    Aggregation.project("chatId", "userOnline"),
                    Aggregation.group("chatId")
                            .count().`as`("participantsCount")
                            .sum(
                                    ConditionalOperators
                                            .`when`("userOnline")
                                            .then(1)
                                            .otherwise(0)
                            )
                            .`as`("onlineParticipantsCount")
            )

            val chatParticipantsCount = reactiveMongoTemplate.aggregate(
                    aggregation,
                    "chatParticipation",
                    ChatParticipantsCountResult::class.java
            )
                    .collectList()
                    .awaitFirst()
                    .map { result -> ChatParticipantsCount(
                            id = ObjectId().toHexString(),
                            chatId = result.chatId,
                            participantsCount = result.participantsCount,
                            onlineParticipantsCount = result.onlineParticipantsCount
                    ) }

            val bulkOperations = reactiveMongoTemplate.bulkOps(
                    BulkOperations.BulkMode.UNORDERED,
                    ChatParticipantsCount::class.java
            )

            chatParticipantsCount.forEach { document -> bulkOperations.insert(document) }

            bulkOperations.execute().awaitFirst()

            log.info("Finished migration: populate chat participants and online participants count")

            return@mono
        }
    }

    private data class ChatParticipantsCountResult(
            private val _id: String,
            val participantsCount: Int,
            val onlineParticipantsCount: Int
    ) {
        val chatId: String
            get() = _id
    }
}