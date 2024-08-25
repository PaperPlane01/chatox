package chatox.chat.api.response

data class GlobalNotificationsSettingsResponse(
        val groupChats: NotificationsSettingsResponse,
        val groupChatsExceptions: List<ChatNotificationsSettingsResponse>,
        val dialogs: NotificationsSettingsResponse,
        val dialogChatsExceptions: List<ChatNotificationsSettingsResponse>
)
