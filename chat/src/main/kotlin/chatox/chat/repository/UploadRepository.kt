package chatox.chat.repository

import chatox.chat.model.Upload
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Mono

interface UploadRepository : ReactiveMongoRepository<Upload<Any>, String> {
    fun <MedataType>save(upload: Upload<MedataType>): Mono<Upload<MedataType>>
    override fun findById(id: String): Mono<Upload<Any>>
}
