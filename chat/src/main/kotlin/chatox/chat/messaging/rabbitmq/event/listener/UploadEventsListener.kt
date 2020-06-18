package chatox.chat.messaging.rabbitmq.event.listener

import chatox.chat.messaging.rabbitmq.event.UploadCreated
import chatox.chat.service.UploadService
import com.rabbitmq.client.Channel
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class UploadEventsListener(private val uploadService: UploadService) {

    @RabbitListener(queues = ["chat_service_upload_created"])
    fun onUploadCreated(uploadCreated: UploadCreated<Any>,
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
