package chatox.chat.messaging.rabbitmq.event.listener

import chatox.chat.exception.UploadNotFoundException
import chatox.chat.messaging.rabbitmq.event.StickerPackCreated
import chatox.chat.model.Sticker
import chatox.chat.repository.mongodb.StickerRepository
import chatox.chat.repository.mongodb.UploadRepository
import com.rabbitmq.client.Channel
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class StickerEventsListener(
        private val stickerRepository: StickerRepository,
        private val uploadRepository: UploadRepository) {

    @RabbitListener(queues = ["chat_service_sticker_pack_created"])
    fun onStickerPackCreated(stickerPackCreated: StickerPackCreated,
                             channel: Channel,
                             @Header(AmqpHeaders.DELIVERY_TAG) deliveryTag: Long) {
        mono {
            val stickers = stickerPackCreated.stickers.map { sticker -> Sticker(
                    id = sticker.id,
                    upload = sticker.upload.toUpload(),
                    stickerPackId = stickerPackCreated.id,
                    emojis = sticker.emojis,
                    keywords = sticker.keywords
            ) }

            stickerRepository.saveAll(stickers).collectList().awaitFirst()
        }
                .doOnSuccess { channel.basicAck(deliveryTag, false) }
                .doOnError { channel.basicNack(deliveryTag, false, true) }
                .subscribe()
    }
}
