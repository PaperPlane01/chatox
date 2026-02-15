package chatox.chat.repository.mongodb.custom.impl

import chatox.chat.model.StickerUploadMetadata
import chatox.chat.model.Upload
import chatox.chat.repository.mongodb.custom.UploadCustomRepository
import chatox.platform.upload.UploadType
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
class UploadCustomRepositoryImpl(private val mongoTemplate: ReactiveMongoTemplate) : UploadCustomRepository {

    override fun findStickerById(id: String): Mono<Upload<StickerUploadMetadata>> {
        return mongoTemplate.findById(id, Upload::class.java)
                .filter { upload -> UploadType.isStickerUploadType(upload.type) }
                .map(::asSticker)
    }

    override fun findStickersByIdIn(ids: List<String>): Flux<Upload<StickerUploadMetadata>> {
        val query = Query()
        query.addCriteria(Criteria.where("_id").`in`(ids))

        return mongoTemplate.find(query, Upload::class.java)
                .filter { upload -> UploadType.isStickerUploadType(upload.type) }
                .map(::asSticker)
    }

    @Suppress("UNCHECKED_CAST")
    private fun asSticker(upload: Upload<*>) = upload as Upload<StickerUploadMetadata>
}