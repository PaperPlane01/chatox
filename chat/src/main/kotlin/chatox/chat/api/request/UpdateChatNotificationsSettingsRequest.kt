package chatox.chat.api.request

import chatox.chat.model.NotificationLevel
import chatox.chat.model.NotificationSound
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull

data class UpdateChatNotificationsSettingsRequest(
        @field:JsonProperty("level")
        @field:NotNull
        private val _level: NotificationLevel,

        val sound: NotificationSound,
        val userExceptions: Map<String, UpdateNotificationsSettingsRequest>? = null
) {
    val level: NotificationLevel
        get() = _level!!
}
