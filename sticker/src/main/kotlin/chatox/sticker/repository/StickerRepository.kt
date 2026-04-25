package chatox.sticker.repository

import chatox.sticker.model.Sticker
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux

interface StickerRepository : ReactiveMongoRepository<Sticker, String> {
    fun findAllByStickerPackId(stickerPackId: String): Flux<Sticker>
    fun findByStickerPackIdIn(ids: List<String>): Flux<Sticker>
}
