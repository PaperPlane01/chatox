package chatox.user.messaging.rabbitmq.event.listener

import chatox.user.domain.ImageUploadMetadata
import chatox.user.messaging.rabbitmq.event.UploadCreated
import chatox.user.service.UploadService
import com.rabbitmq.client.Channel
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class UploadEventsListener(private val uploadService: UploadService) {

    @RabbitListener(queues = ["user_service_image_created"])
    fun onImageCreated(uploadCreated: UploadCreated<ImageUploadMetadata>,
                       channel: Channel,
                       @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        if (!uploadCreated.isPreview && !uploadCreated.isThumbnail) {
            uploadService.saveUpload(uploadCreated)
                    .doOnSuccess { channel.basicAck(tag, false) }
                    .doOnError { channel.basicNack(tag, true, true) }
                    .subscribe()
        }
    }
}
