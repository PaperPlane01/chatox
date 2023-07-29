package chatox.chat.api.request

import jakarta.validation.constraints.Size

data class DeleteMultipleMessagesRequest(
        @field:Size(max = 50)
        val messagesIds: List<String>
)
