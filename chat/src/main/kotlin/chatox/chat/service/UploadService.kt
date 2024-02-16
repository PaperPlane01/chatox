package chatox.chat.service

import chatox.chat.api.response.UploadResponse
import chatox.chat.messaging.rabbitmq.event.UploadCreated
import chatox.chat.messaging.rabbitmq.event.UploadDeleted
import chatox.chat.model.Upload
import reactor.core.publisher.Mono

interface UploadService {
    fun <MetadataType>saveUpload(uploadCreated: UploadCreated<MetadataType>): Mono<UploadResponse<MetadataType>>
    fun findUploadEntity(id: String): Mono<Upload<Any>>
    fun deleteUpload(uploadDeleted: UploadDeleted): Mono<Unit>
}
