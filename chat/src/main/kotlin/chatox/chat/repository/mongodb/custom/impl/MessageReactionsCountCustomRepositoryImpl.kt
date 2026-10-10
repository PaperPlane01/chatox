package chatox.chat.repository.mongodb.custom.impl

import chatox.chat.model.MessageReactionsCount
import chatox.chat.repository.mongodb.custom.MessageReactionsCountCustomRepository
import chatox.platform.text.api.response.EmojiData
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
class MessageReactionsCountCustomRepositoryImpl(
    private val mongoTemplate: ReactiveMongoTemplate) : MessageReactionsCountCustomRepository {

    companion object {
        const val EMOJI_ID = "emojiId"
        const val MESSAGE_ID = "messageId"
        const val COUNT = "count"
    }

    override fun incrementReactionsCount(
        messageId: String,
        emojiData: EmojiData
    ): Mono<MessageReactionsCount> {
        return mono {
            val query = Query().addCriteria(
                Criteria.where(MESSAGE_ID).`is`(messageId)
                    .andOperator(Criteria.where(EMOJI_ID).`is`(emojiData.id))
            )

            return@mono if (mongoTemplate.exists(query, MessageReactionsCount::class.java).awaitFirst()) {
                val update = Update().inc(COUNT, 1)

                mongoTemplate.findAndModify(
                    query,
                    update,
                    FindAndModifyOptions().returnNew(true),
                    MessageReactionsCount::class.java
                )
                    .awaitFirst()
            } else {
                mongoTemplate.save(MessageReactionsCount(
                    id = ObjectId().toHexString(),
                    messageId = messageId,
                    emojiId = emojiData.id,
                    emoji = emojiData,
                    count = 1
                ))
                    .awaitFirst()
            }
        }
    }

    override fun decrementReactionsCount(
        messageId: String,
        emojiData: EmojiData
    ): Mono<MessageReactionsCount> {
        val query = Query().addCriteria(
            Criteria.where(MESSAGE_ID).`is`(messageId)
                .andOperator(
                    Criteria.where(EMOJI_ID).`is`(emojiData.id),
                    Criteria.where(COUNT).gt(0)
                )
        )
        val update = Update().inc(COUNT, -1)

        return mongoTemplate.findAndModify(
            query,
            update,
            FindAndModifyOptions().returnNew(true),
            MessageReactionsCount::class.java
        )
    }
}