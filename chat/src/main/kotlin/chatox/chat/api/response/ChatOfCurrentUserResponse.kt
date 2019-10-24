package chatox.chat.api.response

data class ChatOfCurrentUserResponse(
        val id: String,
        val slug: String,
        val lastReadMessage: MessageResponse?,
        val name: String,
        val avatarUri: String?,
        val chatParticipation: ChatParticipationMinifiedResponse,
        val unreadMessagesCount: Int
)
