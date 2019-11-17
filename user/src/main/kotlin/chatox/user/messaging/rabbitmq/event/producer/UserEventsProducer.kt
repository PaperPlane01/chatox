package chatox.user.messaging.rabbitmq.event.producer

import chatox.user.api.response.UserResponse
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component

@Component
class UserEventsProducer(private val rabbitTemplate: RabbitTemplate) {
    fun userCreated(userResponse: UserResponse) = rabbitTemplate.convertAndSend(
            "user.events",
            "user.created.#",
            userResponse
    )

    fun userUpdated(userResponse: UserResponse) = rabbitTemplate.convertAndSend(
            "user.events",
            "user.updated.#",
            userResponse
    )

    fun userDeleted(id: String) = rabbitTemplate.convertAndSend(
            "user.events",
            "user.deleted.#",
            hashMapOf(Pair("id", id))
    )
}
