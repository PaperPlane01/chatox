package chatox.sticker.repository

import chatox.sticker.model.Upload
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux

interface UploadRepository : ReactiveMongoRepository<Upload<*>, String> {
    fun findAllByIdIn(ids: Collection<String>): Flux<Upload<*>>
}
