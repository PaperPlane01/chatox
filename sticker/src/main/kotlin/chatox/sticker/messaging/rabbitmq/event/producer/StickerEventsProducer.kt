package chatox.sticker.messaging.rabbitmq.event.producer

import chatox.sticker.api.response.StickerPackResponse
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component

@Component
class StickerEventsProducer(private val rabbitTemplate: RabbitTemplate) {

    fun stickerPackCreated(stickerPackResponse: StickerPackResponse<Any>) = rabbitTemplate.convertAndSend(
            "sticker.events",
            "sticker.pack.created.#",
            stickerPackResponse
    )
}
