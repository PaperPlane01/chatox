package chatox.user.messaging.rabbitmq.event.producer

import chatox.user.messaging.rabbitmq.event.UserAddedToBlacklist
import chatox.user.messaging.rabbitmq.event.UserRemovedFromBlacklist
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component

@Component
class BlacklistEventsProducer(private val rabbitTemplate: RabbitTemplate) {

    fun userAddedToBlacklist(userAddedToBlacklist: UserAddedToBlacklist) = rabbitTemplate.convertAndSend(
            "user.events",
            "user.blacklist.added.#",
            userAddedToBlacklist
    )

    fun userRemovedFromBlacklist(userRemovedFromBlacklist: UserRemovedFromBlacklist) = rabbitTemplate.convertAndSend(
            "user.events",
            "user.blacklist.removed.#",
            userRemovedFromBlacklist
    )
}
