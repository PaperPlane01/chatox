package chatox.chat.mongo.migration

import chatox.chat.model.UnreadMessagesCount
import com.kuliginstepan.mongration.annotation.Changelog
import com.kuliginstepan.mongration.annotation.Changeset
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.slf4j.LoggerFactory
import org.springframework.data.mongodb.core.BulkOperations
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.aggregation.Aggregation
import org.springframework.data.mongodb.core.aggregation.ArrayOperators
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Changelog
class UnreadMessagesCountMigrations {
    private val log = LoggerFactory.getLogger(this.javaClass)

    @Changeset(author = "mongration", order = 1)
    fun populateUnreadMessagesCount(reactiveMongoTemplate: ReactiveMongoTemplate): Mono<Unit> {
        return mono {
            log.info("Executing migration: populate unread messages count")

            var page = 0L
            val pageSize = 100L

            while (true) {
                val aggregation = Aggregation.newAggregation(
                        Aggregation.lookup()
                                .from("chat")
                                .localField("chatId")
                                .foreignField("_id")
                                .pipeline(Aggregation.project( "lastMessageId", "lastMessageCreatedAt"))
                                .`as`("chat"),
                        Aggregation.project()
                                .and("user").`as`("user")
                                .and(ArrayOperators.ArrayElemAt.arrayOf("chat").elementAt(0)).`as`("chat"),
                        Aggregation.skip(page * pageSize),
                        Aggregation.limit(pageSize),
                )

                val result = reactiveMongoTemplate.aggregate(
                        aggregation,
                        "chatParticipation",
                        LastMessageIdAndDateByChatParticipationQueryResult::class.java
                )
                        .collectList()
                        .awaitFirst()

                val bulkOperations = reactiveMongoTemplate.bulkOps(
                        BulkOperations.BulkMode.UNORDERED,
                        UnreadMessagesCount::class.java
                )

                result.forEach { chatParticipationWithLastMessageData -> bulkOperations.insert(UnreadMessagesCount(
                        id = ObjectId().toHexString(),
                        chatParticipationId = chatParticipationWithLastMessageData.id,
                        chatId = chatParticipationWithLastMessageData.chat.id,
                        userId = chatParticipationWithLastMessageData.user.id,
                        unreadMessagesCount = 0,
                        lastReadMessageId = chatParticipationWithLastMessageData.chat.lastMessageId,
                        lastReadMessageCreatedAt = chatParticipationWithLastMessageData.chat.lastMessageCreatedAt,
                        lastMessageReadAt = ZonedDateTime.now()
                )) }

                bulkOperations.execute().awaitFirst()

                if (result.size.toLong() == pageSize) {
                    page += 1
                } else {
                    break
                }
            }

            log.info("Finished migration: populate unread messages count")
        }
    }

    private data class LastMessageIdAndDateByChatParticipationQueryResult(
            val _id: String,
            val user: UserProjection,
            val chat: ChatProjection
    ) {
        val id: String
            get() = _id
    }

    private data class ChatProjection(
            val _id: String,
            val lastMessageId: String?,
            val lastMessageCreatedAt: ZonedDateTime?
    ) {
        val id: String
            get() = _id
    }

    private data class UserProjection(
            val _id: String
    ) {
        val id: String
            get() = _id
    }
}