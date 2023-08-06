package chatox.chat.api.request

import chatox.chat.model.ChatDeletionReason
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class DeleteChatRequest(
        @field:NotNull
        @field:JsonProperty("reason")
        private val _reason: ChatDeletionReason?,

        @field:Size(max = 250)
        val comment: String?
) {
    val reason: ChatDeletionReason
            get() = _reason!!

}
