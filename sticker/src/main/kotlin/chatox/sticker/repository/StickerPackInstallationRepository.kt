package chatox.sticker.repository

import chatox.sticker.model.StickerPackInstallation
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface StickerPackInstallationRepository : ReactiveMongoRepository<StickerPackInstallation, String> {
    fun findAllByUserId(userId: String): Flux<StickerPackInstallation>
    fun deleteByUserIdAndStickerPackId(userId: String, stickerPackId: String): Mono<Void>
}
