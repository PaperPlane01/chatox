package chatox.user.messaging.rabbitmq.event.producer

import chatox.user.messaging.rabbitmq.event.UserInteractionCreated
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component

@Component
class UserInteractionEventsProducer(private val rabbitTemplate: RabbitTemplate) {

    fun userInteractionCreated(userInteractionCreated: UserInteractionCreated) = rabbitTemplate.convertAndSend(
            "user.interactions.events",
            "user.interaction.created.#",
            userInteractionCreated
    )
}