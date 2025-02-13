package chatox.sticker.mongo.migrations

import chatox.platform.upload.UploadType
import chatox.sticker.model.StickerPack
import com.kuliginstepan.mongration.annotation.Changelog
import com.kuliginstepan.mongration.annotation.Changeset
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import reactor.core.publisher.Mono

@Changelog
class StickerPackMigrations {
    private val log = LoggerFactory.getLogger(this.javaClass)

    @Changeset(order = 1, author = "mongration")
    fun addTypeAndAnimatedFields(mongoTemplate: ReactiveMongoTemplate): Mono<Unit> {
        return mono {
            log.info("Starting migration: add stickersType and animated fields to sticker packs")

            val update = Update()
                    .set("stickersType", UploadType.IMAGE_STICKER.name)
                    .set("animated", false)

            mongoTemplate.updateMulti(
                    Query(),
                    update,
                    StickerPack::class.java
            )
                    .awaitFirst()

            log.info("Finished migration: add stickersType and animated fields to sticker packs")

            return@mono
        }
    }
}