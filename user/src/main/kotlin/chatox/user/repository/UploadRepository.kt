package chatox.user.repository

import chatox.user.domain.Upload
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Mono

interface UploadRepository : ReactiveMongoRepository<Upload<Any>, String> {
    fun <Metadata>save(upload: Upload<Metadata>): Mono<Upload<Metadata>>
    override fun findById(id: String): Mono<Upload<Any>>
}
