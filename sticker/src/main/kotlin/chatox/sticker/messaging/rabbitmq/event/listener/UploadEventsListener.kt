package chatox.sticker.messaging.rabbitmq.event.listener

import chatox.sticker.mapper.UploadMapper
import chatox.sticker.messaging.rabbitmq.event.UploadCreated
import chatox.sticker.model.StickerUploadMetadata
import chatox.sticker.repository.UploadRepository
import com.rabbitmq.client.Channel
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class UploadEventsListener(private val uploadRepository: UploadRepository, private val uploadMapper: UploadMapper) {
    private val log = LoggerFactory.getLogger(this.javaClass)

    @RabbitListener(queues = ["sticker_service_image_sticker_upload_created"])
    fun onImageStickerUploadCreated(
        uploadCreated: UploadCreated<StickerUploadMetadata>,
        channel: Channel,
        @Header(AmqpHeaders.DELIVERY_TAG) deliveryTag: Long
    ) {
        saveImageUpload(uploadCreated, channel, deliveryTag)
    }

    @RabbitListener(queues = ["sticker_service_webp_sticker_upload_created"])
    fun onWebpStickerUploadCreated(
        uploadCreated: UploadCreated<StickerUploadMetadata>,
        channel: Channel,
        @Header(AmqpHeaders.DELIVERY_TAG) deliveryTag: Long
    ) {
        saveImageUpload(uploadCreated, channel, deliveryTag)
    }

    private fun saveImageUpload(
        uploadCreated: UploadCreated<StickerUploadMetadata>,
        channel: Channel,
        @Header(AmqpHeaders.DELIVERY_TAG) deliveryTag: Long
    ) {
        if (uploadCreated.isPreview || uploadCreated.isThumbnail) {
            channel.basicAck(deliveryTag, false)
            return
        }

        saveStickerUpload(uploadCreated, channel, deliveryTag)
    }

    @RabbitListener(queues = ["sticker_service_video_sticker_upload_created"])
    fun onVideoStickerUploadCreated(
        uploadCreated: UploadCreated<StickerUploadMetadata>,
        channel: Channel,
        @Header(AmqpHeaders.DELIVERY_TAG) deliveryTag: Long
    ) {
        saveStickerUpload(uploadCreated, channel, deliveryTag)
    }

    @RabbitListener(queues = ["sticker_service_lottie_sticker_upload_created"])
    fun onLottieStickerUploadCreated(
        uploadCreated: UploadCreated<StickerUploadMetadata>,
        channel: Channel,
        @Header(AmqpHeaders.DELIVERY_TAG) deliveryTag: Long
    ) {
        saveStickerUpload(uploadCreated, channel, deliveryTag)
    }

    private fun saveStickerUpload(
        uploadCreated: UploadCreated<StickerUploadMetadata>,
        channel: Channel,
        @Header(AmqpHeaders.DELIVERY_TAG) deliveryTag: Long
    ) {
        mono {
            uploadRepository.save(uploadMapper.fromUploadCreated(uploadCreated, uploadCreated.previewImage))
                .awaitFirst()
        }
            .doOnSuccess { channel.basicAck(deliveryTag, false) }
            .doOnError { error ->
                log.error("Error occurred when tried to save upload", error)
                channel.basicNack(deliveryTag, false, true)
            }
            .subscribe()
    }
}
