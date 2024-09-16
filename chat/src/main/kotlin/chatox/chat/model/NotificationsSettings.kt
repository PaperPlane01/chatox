package chatox.chat.model

data class NotificationsSettings(
        val level: NotificationLevel,
        val sound: NotificationSound,
        val userExceptions: Map<String, UserNotificationSettings>? = null
)
