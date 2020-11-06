package chatox.chat.api.request

import chatox.chat.model.ChatDeletionReason
import com.fasterxml.jackson.annotation.JsonProperty
import javax.validation.constraints.NotNull
import javax.validation.constraints.Size

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
