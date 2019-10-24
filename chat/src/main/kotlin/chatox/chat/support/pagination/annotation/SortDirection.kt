package chatox.chat.support.pagination.annotation

annotation class SortDirection(
        val allowed: Array<String> = ["asc", "desc"],
        val default: String = "asc",
        val required: Boolean = false
)
