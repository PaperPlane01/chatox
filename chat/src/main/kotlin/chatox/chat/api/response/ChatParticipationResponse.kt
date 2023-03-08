package chatox.chat.api.response

data class ChatParticipationResponse(
        val id: String?,
        val chatId: String,
        val user: UserResponse,
        val role: ChatRoleResponse
)
