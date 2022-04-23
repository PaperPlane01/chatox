package chatox.chat.repository

import chatox.chat.model.Upload
import chatox.chat.model.UploadType
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface UploadRepository : ReactiveMongoRepository<Upload<Any>, String> {
    fun <MedataType>save(upload: Upload<MedataType>): Mono<Upload<MedataType>>
    fun <MetadataType>findByIdAndType(id: String, type: UploadType): Mono<Upload<MetadataType>>
    fun <Any>findAllById(ids: List<String>): Flux<Upload<Any>>
}
