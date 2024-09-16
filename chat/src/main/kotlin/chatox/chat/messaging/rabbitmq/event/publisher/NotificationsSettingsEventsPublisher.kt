package chatox.chat.messaging.rabbitmq.event.publisher

import chatox.chat.messaging.rabbitmq.event.ChatNotificationsSettingsDeleted
import chatox.chat.messaging.rabbitmq.event.ChatNotificationsSettingsUpdated
import chatox.chat.messaging.rabbitmq.event.GlobalNotificationsSettingsUpdated
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component

@Component
class NotificationsSettingsEventsPublisher(private val rabbitTemplate: RabbitTemplate) {

    fun globalNotificationsSettingsUpdated(
            globalNotificationsSettingsUpdated: GlobalNotificationsSettingsUpdated
    ) = rabbitTemplate.convertAndSend(
            "notification.events",
            "notification.settings.global.updated.#",
            globalNotificationsSettingsUpdated
    )

    fun chatNotificationsSettingsUpdated(
            chatNotificationsSettingsUpdated: ChatNotificationsSettingsUpdated
    ) = rabbitTemplate.convertAndSend(
            "notification.events",
            "notification.settings.chat.updated.#",
            chatNotificationsSettingsUpdated
    )

    fun chatNotificationsSettingsDeleted(
            chatNotificationsSettingsDeleted: ChatNotificationsSettingsDeleted
    ) = rabbitTemplate.convertAndSend(
            "notification.events",
            "notification.settings.chat.deleted.#",
            chatNotificationsSettingsDeleted
    )
}