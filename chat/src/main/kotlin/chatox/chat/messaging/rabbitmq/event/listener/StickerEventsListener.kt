package chatox.chat.messaging.rabbitmq.event.listener

import chatox.chat.messaging.rabbitmq.event.StickerPackCreated
import chatox.chat.messaging.rabbitmq.event.StickerPackUpdated
import chatox.chat.model.Sticker
import chatox.chat.repository.mongodb.StickerRepository
import com.rabbitmq.client.Channel
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class StickerEventsListener(private val stickerRepository: StickerRepository) {

    @RabbitListener(queues = ["chat_service_sticker_pack_created"])
    fun onStickerPackCreated(stickerPackCreated: StickerPackCreated<*>,
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

    @RabbitListener(queues = ["chat_service_sticker_pack_updated"])
    fun onStickerPackUpdated(stickerPackUpdated: StickerPackUpdated,
                             channel: Channel,
                             @Header(AmqpHeaders.DELIVERY_TAG) deliveryTag: Long) {
        mono {
            if (stickerPackUpdated.newStickers.isNotEmpty()) {
                val newStickers = stickerPackUpdated.newStickers.map { sticker -> Sticker(
                        id = sticker.id,
                        upload = sticker.upload.toUpload(),
                        stickerPackId = stickerPackUpdated.stickerPack.id,
                        emojis = sticker.emojis,
                        keywords = sticker.keywords
                ) }
                stickerRepository.saveAll(newStickers).collectList().awaitFirst()
            }

            if (stickerPackUpdated.removedStickers.isNotEmpty()) {
                val deletedStickers = stickerPackUpdated.removedStickers.map { sticker -> sticker.id }
                stickerRepository.deleteAllById(deletedStickers).awaitFirstOrNull()
            }
        }
                .doOnSuccess { channel.basicAck(deliveryTag, false) }
                .doOnError { channel.basicNack(deliveryTag, false, true) }
                .subscribe()
    }
}
