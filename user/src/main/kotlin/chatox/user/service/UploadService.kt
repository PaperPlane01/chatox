package chatox.user.service

import chatox.user.api.response.UploadResponse
import chatox.user.messaging.rabbitmq.event.UploadCreated
import reactor.core.publisher.Mono

interface UploadService {
    fun <MetadataType>saveUpload(uploadCreated: UploadCreated<MetadataType>): Mono<UploadResponse<MetadataType>>
}
