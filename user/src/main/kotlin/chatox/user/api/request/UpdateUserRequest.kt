package chatox.user.api.request

data class UpdateUserRequest(
        val firstName: String?,
        val lastName: String?,
        val bio: String?,
        val avatarUri: String?,
        val slug: String?
)
