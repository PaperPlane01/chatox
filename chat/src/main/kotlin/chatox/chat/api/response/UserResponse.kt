package chatox.chat.api.response

data class UserResponse(
        val id: String,
        val firstName: String,
        val lastName: String?,
        val slug: String?,
        val avatarUri: String?,
        val deleted: Boolean
)
