package chatox.chat.api.response

data class ChatParticipationMinifiedResponse(
        val id: String?,
        val role: ChatRoleResponse? = null,
        val activeChatBlocking: ChatBlockingResponse? = null,
        val pending: Boolean = false
)
