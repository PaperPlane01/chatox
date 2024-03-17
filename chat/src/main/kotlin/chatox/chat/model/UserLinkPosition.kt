package chatox.chat.model

data class UserLinkPosition(
        val start: Int,
        val end: Int,
        val userIdOrSlug: String
)