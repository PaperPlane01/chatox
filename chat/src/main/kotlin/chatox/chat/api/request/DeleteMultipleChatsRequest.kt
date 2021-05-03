package chatox.chat.api.request

import javax.validation.constraints.Size

data class DeleteMultipleChatsRequest(
        @field:Size(min = 1, max = 50)
        val chatDeletions: List<DeleteChatRequestWithChatId>
)
