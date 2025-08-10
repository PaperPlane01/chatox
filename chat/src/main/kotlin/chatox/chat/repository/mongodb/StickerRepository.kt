package chatox.chat.repository.mongodb

import chatox.chat.model.Sticker
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Mono

interface StickerRepository : ReactiveMongoRepository<Sticker, String> {
    fun deleteAllByStickerPackId(stickerPackId: String): Mono<Unit>
}
