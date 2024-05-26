package chatox.chat.api.response

import chatox.chat.model.NotificationLevel
import chatox.chat.model.NotificationSound

data class NotificationsSettingsResponse(
        val level: NotificationLevel,
        val sound: NotificationSound
)
