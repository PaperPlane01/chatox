package chatox.chat.api.response

data class TransferChatOwnershipResponse(
    val chatId: String,
    val oldOwner: ChatParticipationResponse,
    val newOwner: ChatParticipationResponse
)
