package chatox.chat.api.response

data class UserNotificationsSettingsResponse(
        val user: UserResponse,
        val notificationsSettings: NotificationsSettingsResponse
)