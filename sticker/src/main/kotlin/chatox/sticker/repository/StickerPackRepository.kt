package chatox.sticker.repository

import chatox.sticker.model.StickerPack
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux

interface StickerPackRepository : ReactiveMongoRepository<StickerPack<Any>, String> {
    fun findByNameLikeIgnoreCase(name: String, pageable: Pageable): Flux<StickerPack<Any>>
    fun findAllByCreatedBy(createdBy: String): Flux<StickerPack<Any>>
}
