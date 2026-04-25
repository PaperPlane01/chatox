package chatox.sticker.mongo.migrations

import chatox.platform.upload.UploadType
import chatox.sticker.model.StickerPack
import com.kuliginstepan.mongration.annotation.Changelog
import com.kuliginstepan.mongration.annotation.Changeset
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.data.mongodb.core.BulkOperations
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.aggregation.Aggregation
import org.springframework.data.mongodb.core.aggregation.ConvertOperators
import org.springframework.data.mongodb.core.query.Criteria
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

    @Changeset(order = 2, author = "mongration")
    fun addStickersFieldToStickerPack(mongoTemplate: ReactiveMongoTemplate): Mono<Unit> {
        return mono {
            log.info("Starting migration: add sticker ids field to sticker packs")

            var currentPage = 0L
            val pageSize = 100L
            var completed = false

            while (!completed) {
                log.info("Processing sticker packs page {}", currentPage)

                val stickerPacksAggregation = Aggregation.newAggregation(
                    Aggregation.project().and(ConvertOperators.ToString.toString("\$_id")).`as`("_id"),
                    Aggregation.lookup()
                        .from("sticker")
                        .localField("_id")
                        .foreignField("stickerPackId")
                        .pipeline(Aggregation.project("_id"))
                        .`as`("stickers"),
                    Aggregation.skip(pageSize * currentPage),
                    Aggregation.limit(pageSize)
                )
                val stickerPacksWithStickers = mongoTemplate.aggregate(
                    stickerPacksAggregation,
                    "stickerPack",
                    StickerPackQueryResult::class.java
                )
                    .collectList()
                    .awaitFirst()

                val bulkOperations = mongoTemplate.bulkOps(
                    BulkOperations.BulkMode.ORDERED,
                    StickerPack::class.java
                )

                stickerPacksWithStickers.forEach { stickerPack ->
                    log.info("Adding update operation for sticker pack {}", stickerPack.id)
                    val query = Query().addCriteria(Criteria.where("_id").`is`(stickerPack.id))
                    val update = Update()
                        .set("stickerIds", stickerPack.stickers.map { sticker -> sticker.id })
                    bulkOperations.updateOne(query, update)
                }

                bulkOperations.execute().awaitFirst()

                if (stickerPacksWithStickers.size.toLong() == pageSize) {
                    log.info("Increasing sticker packs page")
                    currentPage += 1
                } else {
                    log.info("All sticker packs have been processed")
                    completed = true
                }
            }

            log.info("Finished migration: add sticker ids field to sticker packs")
        }
    }

    private data class StickerPackQueryResult(
        private val _id: String,
        val stickers: List<StickerQueryResult>
    ) {
        val id: String
            get() = _id
    }

    private data class StickerQueryResult(
        private val _id: String
    ) {
        val id: String
            get() = _id
    }
}