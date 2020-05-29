package chatox.user.support.pagination.annotation

annotation class SortBy(
        val allowed: Array<String>,
        val default: String,
        val required: Boolean = false
)
