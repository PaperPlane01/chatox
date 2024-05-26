package chatox.chat.api.request

import chatox.chat.model.NotificationLevel
import chatox.chat.model.NotificationSound
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull

data class UpdateNotificationsSettingsRequest(
        @field:JsonProperty("level")
        @field:NotNull
        private val _level: NotificationLevel,

        val sound: NotificationSound = NotificationSound.HAPPY_POP_3
) {
    val level: NotificationLevel
        get() = _level!!
}
