package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class UserGlobalNotificationsSettings(
        @Id
        val id: String,
        override val groupChats: NotificationsSettings,
        override val dialogs: NotificationsSettings
) : GlobalNotificationSettings
