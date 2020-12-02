package chatox.user.api.request

data class GlobalBanFilters(
        val excludeExpired: Boolean = false,
        val excludeCanceled: Boolean = false,
        val bannedUserId: String? = null,
        val bannedById: String? = null
)
