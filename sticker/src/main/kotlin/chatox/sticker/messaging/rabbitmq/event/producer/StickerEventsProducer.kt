package chatox.sticker.messaging.rabbitmq.event.producer

import chatox.sticker.api.response.StickerPackResponse
import chatox.sticker.messaging.rabbitmq.event.StickerPackDeleted
import chatox.sticker.messaging.rabbitmq.event.StickerPackUpdated
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component

@Component
class StickerEventsProducer(private val rabbitTemplate: RabbitTemplate) {

    fun stickerPackCreated(stickerPackResponse: StickerPackResponse<*>) = rabbitTemplate.convertAndSend(
            "sticker.events",
            "sticker.pack.created.#",
            stickerPackResponse
    )

    fun stickerPackUpdated(stickerPackUpdated: StickerPackUpdated) = rabbitTemplate.convertAndSend(
            "sticker.events",
            "sticker.pack.updated.#",
            stickerPackUpdated
    )

    fun stickerPackDeleted(stickerPackDeleted: StickerPackDeleted) = rabbitTemplate.convertAndSend(
            "sticker.events",
            "sticker.pack.deleted.#",
            stickerPackDeleted
    )
}
