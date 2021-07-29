package chatox.sticker.messaging.rabbitmq.event.listener

import chatox.sticker.mapper.UploadMapper
import chatox.sticker.messaging.rabbitmq.event.UploadCreated
import chatox.sticker.model.ImageUploadMetadata
import chatox.sticker.repository.UploadRepository
import com.rabbitmq.client.Channel
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class UploadEventsListener(private val uploadRepository: UploadRepository, private val uploadMapper: UploadMapper) {

    @RabbitListener(queues = ["sticker_service_image_created"])
    fun onImageCreated(uploadCreated: UploadCreated<Any>,
                       channel: Channel,
                       @Header(AmqpHeaders.DELIVERY_TAG) deliveryTag: Long
    ) = uploadRepository.save(uploadMapper.fromUploadCreated(uploadCreated))
            .doOnSuccess { channel.basicAck(deliveryTag, false) }
            .doOnError { channel.basicNack(deliveryTag, false, true) }

    @RabbitListener(queues = ["sticker_service_gif_created"])
    fun onGifCreated(uploadCreated: UploadCreated<Any>,
                     channel: Channel,
                     @Header(AmqpHeaders.DELIVERY_TAG) deliveryTag: Long
    ) = uploadRepository.save(uploadMapper.fromUploadCreated(uploadCreated))
            .doOnSuccess { channel.basicAck(deliveryTag, false) }
            .doOnError { channel.basicNack(deliveryTag, false, true) }
}
