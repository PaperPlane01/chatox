package chatox.chat.messaging.rabbitmq.event.listener

import chatox.chat.messaging.rabbitmq.event.UploadCreated
import chatox.chat.service.UploadService
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class UploadEventsListener(private val uploadService: UploadService) {

    @RabbitListener(queues = ["chat_service_upload_created"])
    fun onUploadCreated(uploadCreated: UploadCreated<Any>) {
        if (!uploadCreated.isPreview && !uploadCreated.isThumbnail) {
            uploadService.saveUpload(uploadCreated).subscribe()
        }
    }
}
