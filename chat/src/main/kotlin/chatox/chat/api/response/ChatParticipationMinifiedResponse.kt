package chatox.chat.api.response

data class ChatParticipationMinifiedResponse(
        val id: String?,
        val role: ChatRoleResponse?,
        val activeChatBlocking: ChatBlockingResponse?
)
