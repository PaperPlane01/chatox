package chatox.chat.api.request

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotEmpty

data class PendingChatParticipantsRequest(
        @field:NotEmpty
        @field:JsonProperty("pendingChatParticipantsIds")
        private val _pendingChatParticipantsIds: List<String>?
) {
    val pendingChatParticipantsIds: List<String>
        get() = _pendingChatParticipantsIds!!
}
