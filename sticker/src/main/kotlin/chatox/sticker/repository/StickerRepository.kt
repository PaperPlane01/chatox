package chatox.sticker.repository

import chatox.sticker.model.Sticker
import chatox.sticker.model.UploadType
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface StickerRepository : ReactiveMongoRepository<Sticker<Any>, String> {
    fun <MetadataType> findByIdAndImageType(id: String, type: UploadType): Mono<Sticker<MetadataType>>
    fun findAllByStickerPackId(stickerPackId: String): Flux<Sticker<Any>>
}
