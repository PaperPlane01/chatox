package chatox.chat.model

interface GlobalNotificationSettings {
    val groupChats: NotificationsSettings
    val dialogs: NotificationsSettings

    companion object DEFAULT: GlobalNotificationSettings {
        override val groupChats: NotificationsSettings = NotificationsSettings(
                level = NotificationLevel.ALL_MESSAGES,
                sound = NotificationSound.HAPPY_POP_3
        )
        override val dialogs: NotificationsSettings = NotificationsSettings(
                level = NotificationLevel.ALL_MESSAGES,
                sound = NotificationSound.HAPPY_POP_3
        )
    }
}