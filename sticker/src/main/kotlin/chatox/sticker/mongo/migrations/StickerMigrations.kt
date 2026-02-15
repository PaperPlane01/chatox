package chatox.sticker.mongo.migrations

import chatox.sticker.model.Sticker
import com.kuliginstepan.mongration.annotation.Changelog
import com.kuliginstepan.mongration.annotation.Changeset
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.aggregation.AggregationUpdate
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import reactor.core.publisher.Mono

@Changelog
class StickerMigrations {
    private val log = LoggerFactory.getLogger(this.javaClass)

    @Changeset(order = 1, author = "mongration")
    fun createUploadField(reactiveMongoTemplate: ReactiveMongoTemplate): Mono<Unit> {
        return mono {
            log.info("Starting executing migration: create \"upload\" field")

            val addUploadField = AggregationUpdate.update().set("upload")
                .toValue("\$image")

            reactiveMongoTemplate.updateMulti(
                Query(),
                addUploadField,
                Sticker::class.java
            )
                .awaitFirst()

            val addAnimatedField = Update().set("upload.meta.animated", false)
            reactiveMongoTemplate.updateMulti(
                Query(),
                addAnimatedField,
                Sticker::class.java
            )
                .awaitFirst()

            log.info("Finished executing migration: create \"upload\" field")

            return@mono
        }
    }
}