package chatox.chat.repository.mongodb.custom

import chatox.chat.model.StickerUploadMetadata
import chatox.chat.model.Upload
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface UploadCustomRepository {
    fun findStickerById(id: String): Mono<Upload<StickerUploadMetadata>>
    fun findStickersByIdIn(ids: List<String>): Flux<Upload<StickerUploadMetadata>>
}