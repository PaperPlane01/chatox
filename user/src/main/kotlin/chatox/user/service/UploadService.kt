package chatox.user.service

import chatox.user.api.response.UploadResponse
import chatox.user.messaging.rabbitmq.event.UploadCreated
import reactor.core.publisher.Mono

interface UploadService {
    fun saveUpload(uploadCreated: UploadCreated<Any>): Mono<UploadResponse<Any>>
}
