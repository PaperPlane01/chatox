package chatox.chat.messaging.rabbitmq.event.listener

import chatox.chat.messaging.rabbitmq.event.UploadCreated
import chatox.chat.model.AudioUploadMetadata
import chatox.chat.model.GifUploadMetadata
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.VideoUploadMetadata
import chatox.chat.service.UploadService
import com.rabbitmq.client.Channel
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class UploadEventsListener(private val uploadService: UploadService) {

    @RabbitListener(queues = ["chat_service_image_created"])
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

    @RabbitListener(queues = ["chat_service_video_created"])
    fun onVideoCreated(uploadCreated: UploadCreated<VideoUploadMetadata>,
                       channel: Channel,
                       @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        uploadService.saveUpload(uploadCreated)
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, true, true) }
                .subscribe()
    }

    @RabbitListener(queues = ["chat_service_audio_created"])
    fun onAudioCreated(uploadCreated: UploadCreated<AudioUploadMetadata>,
                       channel: Channel,
                       @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        uploadService.saveUpload(uploadCreated)
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, true, true) }
                .subscribe()
    }

    @RabbitListener(queues = ["chat_service_gif_created"])
    fun onGifCreated(uploadCreated: UploadCreated<GifUploadMetadata>,
                     channel: Channel,
                     @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        uploadService.saveUpload(uploadCreated)
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, true, true) }
                .subscribe()
    }

    @RabbitListener(queues = ["chat_service_file_created"])
    fun onFileCreated(uploadCreated: UploadCreated<Any>,
                      channel: Channel,
                      @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        uploadService.saveUpload(uploadCreated)
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, true, true) }
                .subscribe()
    }
}
