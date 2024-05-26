package chatox.chat.api.response

import com.fasterxml.jackson.annotation.JsonInclude

data class ChatNotificationsSettingsResponse(
        val chat: ChatResponse,
        val notificationsSettings: NotificationsSettingsResponse,

        @field:JsonInclude(JsonInclude.Include.NON_EMPTY)
        val userExceptions: List<UserNotificationsSettingsResponse>? = null
)
