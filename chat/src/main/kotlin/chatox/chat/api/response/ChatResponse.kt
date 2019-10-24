package chatox.chat.api.response

data class ChatResponse(
        val id: String,
        val name: String,
        val description: String?,
        val avatarUri: String?,
        val tags: List<String> = arrayListOf(),
        val slug: String,
        val createdByCurrentUser: Boolean,
        val numberOfParticipants: Int
)
