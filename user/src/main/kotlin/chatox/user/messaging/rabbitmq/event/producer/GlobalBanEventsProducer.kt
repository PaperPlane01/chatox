package chatox.user.messaging.rabbitmq.event.producer

import chatox.user.api.response.GlobalBanResponse
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component

@Component
class GlobalBanEventsProducer(private val rabbitTemplate: RabbitTemplate) {
    fun globalBanCreated(globalBanResponse: GlobalBanResponse) = rabbitTemplate.convertAndSend(
            "global.ban.events",
            "global.ban.created.#",
            globalBanResponse
    )

    fun globalBanUpdated(globalBanResponse: GlobalBanResponse) = rabbitTemplate.convertAndSend(
            "global.ban.events",
            "global.ban.updated.#",
            globalBanResponse
    )
}
