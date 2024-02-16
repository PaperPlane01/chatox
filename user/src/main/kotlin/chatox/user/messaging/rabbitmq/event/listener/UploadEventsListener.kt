package chatox.user.messaging.rabbitmq.event.listener

import chatox.user.domain.ImageUploadMetadata
import chatox.user.messaging.rabbitmq.event.UploadCreated
import chatox.user.service.UploadService
import com.rabbitmq.client.Channel
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class UploadEventsListener(private val uploadService: UploadService) {
    private val log = LoggerFactory.getLogger(this.javaClass)

    @RabbitListener(queues = ["user_service_image_created"])
    fun onImageCreated(uploadCreated: UploadCreated<ImageUploadMetadata>,
                       channel: Channel,
                       @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        if (!uploadCreated.isPreview && !uploadCreated.isThumbnail) {
            log.debug("Received uploadCreated event {}", uploadCreated)
            uploadService.saveUpload(uploadCreated)
                    .doOnSuccess { channel.basicAck(tag, false) }
                    .doOnError { exception ->
                        exception.printStackTrace()
                        channel.basicNack(tag, false, true)
                    }
                    .subscribe()
        } else {
            log.debug("Skipping saving upload {} because it's either preview or thumbnail", uploadCreated.id)
            channel.basicAck(tag, false)
        }
    }
}
