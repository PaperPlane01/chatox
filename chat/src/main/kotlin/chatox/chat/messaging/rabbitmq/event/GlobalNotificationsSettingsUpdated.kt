package chatox.chat.messaging.rabbitmq.event

import chatox.chat.api.response.NotificationsSettingsResponse

data class GlobalNotificationsSettingsUpdated(
        val userId: String,
        val groupChatSettings: NotificationsSettingsResponse,
        val dialogChatsSettings: NotificationsSettingsResponse
)
