package chatox.chat.messaging.rabbitmq.event.publisher

import chatox.chat.api.response.ChatRoleResponse
import chatox.chat.messaging.rabbitmq.event.ChatRoleAssigned
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component

@Component
class ChatRoleEventsPublisher(private val rabbitTemplate: RabbitTemplate) {

    fun chatRoleCreated(chatRole: ChatRoleResponse) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.role.created.#",
            chatRole
    )

    fun chatRoleUpdated(chatRole: ChatRoleResponse) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.role.updated.#",
            chatRole
    )

    fun chatRoleAssigned(chatRoleAssigned: ChatRoleAssigned) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.role.assigned.#",
            chatRoleAssigned
    )
}