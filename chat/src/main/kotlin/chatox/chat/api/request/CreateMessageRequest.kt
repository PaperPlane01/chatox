package chatox.chat.api.request

data class CreateMessageRequest(
        val text: String,
        val referredMessageId: String?
)
