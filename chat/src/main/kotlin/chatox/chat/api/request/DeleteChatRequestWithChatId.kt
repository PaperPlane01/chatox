package chatox.chat.api.request

import chatox.chat.model.ChatDeletionReason
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class DeleteChatRequestWithChatId(
        @field:NotNull
        @field:JsonProperty("reason")
        private val _reason: ChatDeletionReason?,

        @field:Size(max = 250)
        val comment: String?,

        @field:NotNull
        private val _chatId: String?
) {
    val reason: ChatDeletionReason
        get() = _reason!!

    val chatId: String
        get() = _chatId!!
}
