package chatox.chat.api.request

data class UpdateMessageRequest(
        val text: String?,
        val referredMessageId: String?
)
