package chatox.user.messaging.rabbitmq.event.listener

import chatox.user.domain.UploadType
import chatox.user.messaging.rabbitmq.event.UploadCreated
import chatox.user.service.UploadService
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class UploadEventsListener(private val uploadService: UploadService) {

    @RabbitListener(queues = ["user_service_upload_created"])
    fun onUploadCreated(uploadCreated: UploadCreated<Any>) {
        if (uploadCreated.type == UploadType.IMAGE && !uploadCreated.isThumbnail && !uploadCreated.isPreview) {
            uploadService.saveUpload(uploadCreated).subscribe()
        }
    }
}
