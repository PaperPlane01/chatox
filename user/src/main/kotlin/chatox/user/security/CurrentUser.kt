package chatox.user.security

data class CurrentUser(
        val id: String,
        val roles: List<String>,
        val firstName: String,
        val lastName: String?,
        val slug: String?,
        val avatarUri: String?,
        val accountId: String
)
