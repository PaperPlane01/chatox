package chatox.user.messaging.rabbitmq.event.producer

import chatox.user.api.response.UserResponse
import chatox.user.messaging.rabbitmq.event.UserOffline
import chatox.user.messaging.rabbitmq.event.UserOnline
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

    fun userWentOnline(userOnline: UserOnline) = rabbitTemplate.convertAndSend(
            "user.events",
            "user.online.#",
            userOnline
    )

    fun userWentOffline(userOffline: UserOffline) = rabbitTemplate.convertAndSend(
            "user.events",
            "user.offline.#",
            userOffline
    )
}
