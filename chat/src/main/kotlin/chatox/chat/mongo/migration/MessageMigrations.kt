package chatox.chat.mongo.migration

import chatox.chat.model.Message
import chatox.platform.cache.ReactiveCacheService
import com.kuliginstepan.mongration.annotation.Changelog
import com.kuliginstepan.mongration.annotation.Changeset
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.aggregation.AggregationUpdate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import reactor.core.publisher.Mono

@Changelog
class MessageMigrations {
    private val log = LoggerFactory.getLogger(this.javaClass)

    @Changeset(order = 1, author = "mongration")
    fun addUploadFieldToMessageStickers(
        mongoTemplate: ReactiveMongoTemplate,
        @Qualifier("messageCacheService") messageCache: ReactiveCacheService<Message, String>
    ): Mono<Unit> {
        return mono {
            log.info("Starting migration: add upload field to message stickers")

            val filter = Query.query(Criteria.where("sticker").ne(null))
            val addUploadField = AggregationUpdate.update().set("sticker.upload").toValue("\$sticker.image")

            mongoTemplate.updateMulti(
                filter,
                addUploadField,
                Message::class.java
            )
                .awaitFirst()

            val addAnimatedField = Update().set("sticker.upload.meta.animated", false)

            mongoTemplate.updateMulti(
                filter,
                addAnimatedField,
                Message::class.java
            )
                .awaitFirst()

            log.info("Clearing messages cache")
            messageCache.deleteAll().awaitFirstOrNull()

            log.info("Finished migration: add upload field to message stickers")
            return@mono
        }
    }
}