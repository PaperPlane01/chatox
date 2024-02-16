package chatox.user.api.response

data class UserInteractionsCountResponse(
        val likesCount: Long,
        val dislikesCount: Long,
        val lovesCount: Long
)
