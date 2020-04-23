package chatox.chat.service

import chatox.chat.api.response.UploadResponse
import chatox.chat.messaging.rabbitmq.event.UploadCreated
import reactor.core.publisher.Mono

interface UploadService {
    fun <MetadataType>saveUpload(uploadCreated: UploadCreated<MetadataType>): Mono<UploadResponse<MetadataType>>
}
