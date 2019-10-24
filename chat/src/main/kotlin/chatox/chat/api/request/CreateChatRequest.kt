package chatox.chat.api.request

data class CreateChatRequest(
        val name: String,
        val description: String?,
        val tags: List<String> = arrayListOf(),
        val slug: String?
)
