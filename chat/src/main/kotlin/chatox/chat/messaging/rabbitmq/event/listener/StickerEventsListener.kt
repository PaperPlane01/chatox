package chatox.chat.messaging.rabbitmq.event.listener

import chatox.chat.messaging.rabbitmq.event.StickerPackCreated
import chatox.chat.model.Sticker
import chatox.chat.repository.mongodb.StickerRepository
import chatox.chat.repository.mongodb.UploadRepository
import com.rabbitmq.client.Channel
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class StickerEventsListener(private val stickerRepository: StickerRepository, private val uploadRepository: UploadRepository) {

    @RabbitListener(queues = ["chat_service_sticker_pack_created"])
    fun onStickerPackCreated(stickerPackCreated: StickerPackCreated,
                             channel: Channel,
                             @Header(AmqpHeaders.DELIVERY_TAG) deliveryTag: Long) {
        mono {
            val stickers = arrayListOf<Sticker<Any>>()

            for (sticker in stickerPackCreated.stickers) {
                val image = uploadRepository.findById(sticker.image.id).awaitFirst()
                stickers.add(Sticker(
                        id = sticker.id,
                        image = image,
                        stickerPackId = sticker.stickerPackId,
                        emojis = sticker.emojis,
                        keywords = sticker.keywords
                ))
            }

            stickerRepository.saveAll(stickers).collectList().awaitFirst()
        }
                .doOnSuccess { channel.basicAck(deliveryTag, false) }
                .doOnError { channel.basicNack(deliveryTag, false, true) }
                .subscribe()
    }
}
