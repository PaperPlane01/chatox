package chatox.user.messaging.rabbitmq.event.producer

import chatox.user.api.response.UserResponse
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component

@Component
class UserEventsProducer(private val rabbitTemplate: RabbitTemplate) {
    fun sendUserCreatedEvent(userResponse: UserResponse) = rabbitTemplate.convertAndSend(
            "user.events",
            "user.created.#",
            userResponse
    )

    fun sendUserUpdatedEvent(userResponse: UserResponse) = rabbitTemplate.convertAndSend(
            "user.events",
            "user.updated.#",
            userResponse
    )

    fun sendUserDeletedEvent(id: String) = rabbitTemplate.convertAndSend(
            "user.events",
            "user.deleted.#",
            hashMapOf(Pair("id", id))
    )
}
