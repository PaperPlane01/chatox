package chatox.chat.api.request

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull

data class UpdateGlobalNotificationsSettingsRequest(
        @field:JsonProperty("groupChats")
        @field:NotNull
        private val _groupChats: UpdateNotificationsSettingsRequest,

        @field:JsonProperty("dialogChats")
        @field:NotNull
        private val _dialogChats: UpdateNotificationsSettingsRequest
) {
    val groupChats: UpdateNotificationsSettingsRequest
        get() = _groupChats!!

    val dialogChats: UpdateNotificationsSettingsRequest
        get() = _dialogChats!!
}
