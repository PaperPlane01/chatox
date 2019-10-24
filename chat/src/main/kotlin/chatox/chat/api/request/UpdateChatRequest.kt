package chatox.chat.api.request

data class UpdateChatRequest(
        val name: String?,
        val avatarUri: String?,
        val slug: String?,
        val description: String?,
        val tags: List<String>?
)
