package chatox.chat.messaging.rabbitmq.event

import chatox.chat.api.response.ChatNotificationsSettingsResponse

data class ChatNotificationsSettingsUpdated(
        val userId: String,
        val notificationsSettings: ChatNotificationsSettingsResponse
)
